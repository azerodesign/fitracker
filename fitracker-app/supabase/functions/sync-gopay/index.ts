import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
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
        const q = 'from:no-reply@gojek.com "Bukti Pembayaran"';
        const listRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=10`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const listData = await listRes.json();
        const messages = listData.messages || [];

        let addedCount = 0;
        const errors: string[] = [];

        // 4. Process Messages
        for (const msg of messages) {
            // Check if exists
            const { data: existing } = await supabaseClient
                .from("transactions")
                .select("id")
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
            let bodyData = "";
            if (detail.payload.body.data) {
                bodyData = detail.payload.body.data;
            } else if (detail.payload.parts) {
                const part = detail.payload.parts.find((p: any) => p.mimeType === "text/html");
                if (part && part.body.data) bodyData = part.body.data;
            }

            if (!bodyData) continue;

            // Decode Base64
            const base64 = bodyData.replace(/-/g, '+').replace(/_/g, '/');
            const htmlContent = atob(base64);

            // EXTRACT DATA
            const amountMatch = htmlContent.match(/Total Bayar[\s\S]*?Rp\s*([\d.]+)/i);
            const amountRaw = amountMatch ? amountMatch[1].replace(/\./g, "") : "0";
            const amount = parseFloat(amountRaw);

            const merchantMatch = htmlContent.match(/Pembayaran kepada[\s\S]*?>([^<]+)</i);
            const merchant = merchantMatch ? merchantMatch[1].trim() : "GoPay Transaction";

            // Category
            let category = "Expense";
            const lowerHtml = htmlContent.toLowerCase();
            if (lowerHtml.includes("gofood") || lowerHtml.includes("food")) category = "Food";
            else if (lowerHtml.includes("goride") || lowerHtml.includes("gocar")) category = "Transport";
            else if (lowerHtml.includes("top up") || lowerHtml.includes("topup")) category = "Transfer";

            // Date
            const dateHeader = detail.payload.headers.find((h: any) => h.name === "Date");
            const dateStr = dateHeader ? dateHeader.value : new Date().toISOString();
            const dateObj = new Date(dateStr);
            const dateSql = dateObj.toISOString().split('T')[0];

            // INSERT
            const { error: insertError } = await supabaseClient.from("transactions").insert({
                user_id: user.id,
                type: "Expense",
                amount: amount,
                category: category,
                date: dateSql,
                source_id: msg.id,
                description: merchant
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

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
