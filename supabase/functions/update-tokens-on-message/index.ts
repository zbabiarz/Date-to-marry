import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client, x-custom-header",
};

const FREE_PROMPTS_LIMIT = 3;
const TOKENS_PER_PROMPT = 1;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("Missing required parameter: user_id");
    }

    // Get current token balance
    const { data: tokenData, error: fetchError } = await supabase
      .from("tokens")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // If no token record exists, create one
    if (fetchError && fetchError.code === "PGRST116") {
      // PGRST116 is "No rows found"
      const { data: newTokenData, error: insertError } = await supabase
        .from("tokens")
        .insert({
          user_id,
          balance: 0,
          total_purchased: 0,
          total_used: 0,
          free_prompts_used: 1, // Use first free prompt
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      // Record transaction
      await supabase.from("token_transactions").insert({
        user_id,
        amount: -1, // Deduct 1 credit for free prompts
        transaction_type: "usage",
        description: `Free prompt used (1/${FREE_PROMPTS_LIMIT})`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          freePrompt: true,
          remainingFree: FREE_PROMPTS_LIMIT - 1,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (fetchError) {
      throw fetchError;
    }

    // Check if user still has free prompts
    if (tokenData.free_prompts_used < FREE_PROMPTS_LIMIT) {
      // Update free prompts used
      const { data, error: updateError } = await supabase
        .from("tokens")
        .update({
          free_prompts_used: tokenData.free_prompts_used + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      // Record transaction
      await supabase.from("token_transactions").insert({
        user_id,
        amount: -1, // Deduct 1 credit for free prompts
        transaction_type: "usage",
        description: `Free prompt used (${tokenData.free_prompts_used + 1}/${FREE_PROMPTS_LIMIT})`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          freePrompt: true,
          remainingFree: FREE_PROMPTS_LIMIT - (tokenData.free_prompts_used + 1),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Check if user has enough tokens
    if (tokenData.balance < TOKENS_PER_PROMPT) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Insufficient tokens",
          freePrompt: false,
          tokenBalance: tokenData.balance,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 402,
        },
      );
    }

    // Use tokens
    const { data, error: updateError } = await supabase
      .from("tokens")
      .update({
        balance: tokenData.balance - TOKENS_PER_PROMPT,
        total_used: tokenData.total_used + TOKENS_PER_PROMPT,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    await supabase.from("token_transactions").insert({
      user_id,
      amount: -TOKENS_PER_PROMPT,
      transaction_type: "usage",
      description: "Token used for AI message",
    });

    return new Response(
      JSON.stringify({
        success: true,
        freePrompt: false,
        tokenBalance: data.balance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
