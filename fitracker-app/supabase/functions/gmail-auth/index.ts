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

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const { code, redirect_uri } = await req.json();

        if (!code) throw new Error("No code provided");

        // 1. Get Client ID & Secret from DB
        // We assume the user has already saved them in step 1 of modal
        const { data: integration, error: dbError } = await supabaseClient
            .from("integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", "gmail")
            .single();

        if (dbError || !integration) {
            throw new Error("Integration config not found. Please save keys first.");
        }

        const { client_id, client_secret } = integration;

        // 2. Exchange Code for Tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error("Google Token Error:", tokens);
            throw new Error(`Google Error: ${tokens.error_description || tokens.error}`);
        }

        // 3. Save Tokens to DB
        const updates = {
            refresh_token: tokens.refresh_token, // May be null if not first time? Usually returned if access_type=offline
            access_token: tokens.access_token,
            token_expires_at: Date.now() + tokens.expires_in * 1000,
            is_active: true,
            last_synced_at: new Date().toISOString()
        };

        // Only update refresh_token if it was returned (Google doesn't always return it on re-auth unless prompt=consent)
        if (!tokens.refresh_token && !integration.refresh_token) {
            // Warning: If we don't have a refresh token, we can't sync offline.
            // The modal uses prompt=consent so we SHOULD get it.
        }
        if (!tokens.refresh_token) delete updates.refresh_token;

        const { error: updateError } = await supabaseClient
            .from("integrations")
            .update(updates)
            .eq("id", integration.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400, // or 500
        });
    }
});
