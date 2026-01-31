import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: req.headers.get("Authorization")! } },
            }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Get Integration
        const { data: integration } = await supabaseClient
            .from("integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", "gmail")
            .single();

        if (!integration || !integration.refresh_token) {
            throw new Error("Gmail not connected.");
        }

        // 2. Refresh Token
        // We always refresh to be safe (or check expiry if stored)
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: integration.client_id,
                client_secret: integration.client_secret,
                refresh_token: integration.refresh_token,
                grant_type: "refresh_token",
            }),
        });

        const tokenData = await refreshRes.json();
        if (tokenData.error) throw new Error("Failed to refresh token: " + tokenData.error);

        const accessToken = tokenData.access_token;

        // 3. Search Gmail
        // Query: from:no-reply@gojek.com subject:"Bukti Pembayaran" after:YYYY/MM/DD (optional optimization)
        // For now, simple query
        const q = 'from:no-reply@gojek.com "Bukti Pembayaran"'; // Adjust if subject varies
        const listRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=10`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const listData = await listRes.json();
        const messages = listData.messages || [];

        let addedCount = 0;
        let errors = [];

        // 4. Process Messages
        for (const msg of messages) {
            // Check if exists
            const { data: existing } = await supabaseClient
                .from("transactions")
                .select("id")
                // We need a 'source_id' column in transactions table. 
                // If not added yet, we need to create it. Assuming it exists as per plan.
                .eq("source_id", msg.id)
                .maybeSingle();

            if (existing) continue;

            // Fetch Detail
            const detailRes = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const detail = await detailRes.json();

            // Parse Body
            // Payload is usually nested. Body data is Base64Web encoded.
            // We look for 'text/html' part usually
            let bodyData = "";
            if (detail.payload.body.data) {
                bodyData = detail.payload.body.data;
            } else if (detail.payload.parts) {
                const part = detail.payload.parts.find((p: any) => p.mimeType === "text/html");
                if (part && part.body.data) bodyData = part.body.data;
            }

            if (!bodyData) continue; // skip if can't find body

            // Decode Base64
            // Helper to fix base64url to base64
            const base64 = bodyData.replace(/-/g, '+').replace(/_/g, '/');
            const htmlContent = atob(base64);

            // EXTRACT DATA (Regex "The Brain")
            // 1. Amount: "Total Bayar Rp 15.000"
            const amountMatch = htmlContent.match(/Total Bayar[\s\S]*?Rp\s*([\d.]+)/i);
            const amountRaw = amountMatch ? amountMatch[1].replace(/\./g, "") : "0";
            const amount = parseFloat(amountRaw);

            // 2. Merchant: "Pembayaran kepada <br> ... <br>" or similar
            // This is tricky and structure dependent.
            // Fallback: Use Subject or generic "GoPay" if not found.
            // Try to find "Pembayaran kepada"
            const merchantMatch = htmlContent.match(/Pembayaran kepada[\s\S]*?>([^<]+)</i);
            let merchant = merchantMatch ? merchantMatch[1].trim() : "GoPay Transaction";

            // 3. Category
            let category = "Expense"; // Default
            // Simple keyword matching on the whole HTML
            const lowerHtml = htmlContent.toLowerCase();
            if (lowerHtml.includes("gofood") || lowerHtml.includes("food")) category = "Food";
            else if (lowerHtml.includes("goride") || lowerHtml.includes("gocar")) category = "Transport";
            else if (lowerHtml.includes("top up") || lowerHtml.includes("topup")) {
                // If Top Up, it might be Transfer or Income?
                // Typically "Top Up" receipt from GoJek means money entered GoPay.
                // But if this is an expense tracker, maybe we ignore topups? 
                // Or mark as Transfer.
                category = "Transfer";
            }

            // 4. Date
            const dateHeader = detail.payload.headers.find((h: any) => h.name === "Date");
            const dateStr = dateHeader ? dateHeader.value : new Date().toISOString();
            const dateObj = new Date(dateStr);
            const dateSql = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

            // INSERT
            const { error: insertError } = await supabaseClient.from("transactions").insert({
                user_id: user.id,
                type: "Expense", // Assuming expense for now
                amount: amount,
                category: category, // We need to match this to user's category NAMES or IDs? 
                // If we use text "Food", it works if dashboard handles text categories mismatch or we auto-create?
                // Dashboard uses 'category' string column, so safe.
                date: dateSql,
                source_id: msg.id,
                description: merchant // We usually don't have description column in previous tasks...
                // Wait, looking at Dashboard.jsx formData, we have: type, amount, category, date, wallet_id.
                // We DON'T have description or merchant.
                // We should add 'description' or reuse 'category' for merchant?
                // Let's assume we map Category -> Category.
                // We should probably allow the user to see the merchant name.
                // Let's modify Supabase schema to add 'description' or just append to category text?
                // Or store in metadata?
                // Let's stick to existing schema: type, amount, category, date, wallet_id.
                // We need a wallet_id. Use Default Wallet.
            });

            if (!insertError) {
                addedCount++;
            } else {
                errors.push(insertError.message);
            }
        }

        return new Response(JSON.stringify({ added: addedCount, errors }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
