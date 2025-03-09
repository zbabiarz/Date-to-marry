import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOKENS_PER_DOLLAR = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, amount_cents } = await req.json();

    if (!user_id || !amount_cents) {
      throw new Error("Missing required parameters: user_id and amount_cents");
    }

    // Calculate tokens to add (10 tokens per dollar)
    const tokensToAdd = Math.floor((amount_cents / 100) * TOKENS_PER_DOLLAR);

    // Get current token balance
    const { data: tokenData, error: fetchError } = await supabase
      .from("tokens")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "No rows found"
      throw fetchError;
    }

    let result;

    // If no token record exists, create one
    if (!tokenData) {
      const { data, error: insertError } = await supabase
        .from("tokens")
        .insert({
          user_id,
          balance: tokensToAdd,
          total_purchased: tokensToAdd,
          total_used: 0,
          free_prompts_used: 0,
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      result = data;
    } else {
      // Update existing token balance
      const { data, error: updateError } = await supabase
        .from("tokens")
        .update({
          balance: tokenData.balance + tokensToAdd,
          total_purchased: tokenData.total_purchased + tokensToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      result = data;
    }

    // Record transaction
    await supabase.from("token_transactions").insert({
      user_id,
      amount: tokensToAdd,
      transaction_type: "purchase",
      description: `Purchased ${tokensToAdd} tokens ($${amount_cents / 100})`,
      metadata: { amount_cents },
    });

    return new Response(
      JSON.stringify({
        success: true,
        tokens_added: tokensToAdd,
        new_balance: result.balance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
