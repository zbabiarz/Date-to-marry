import { createClient } from "../../supabase/server";
import { FREE_PROMPTS_LIMIT, TOKENS_PER_PROMPT } from "@/types/tokens";

/**
 * Get a user's token balance
 */
export async function getUserTokenBalance(userId: string) {
  const supabase = await createClient();

  // Check if user has a token record
  const { data: tokenData, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows found"
    console.error("Error fetching token balance:", error);
    throw error;
  }

  // If no token record exists, create one
  if (!tokenData) {
    const { data: newTokenData, error: insertError } = await supabase
      .from("tokens")
      .insert({
        user_id: userId,
        balance: 0,
        total_purchased: 0,
        total_used: 0,
        free_prompts_used: 0,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error creating token record:", insertError);
      throw insertError;
    }

    return newTokenData;
  }

  return tokenData;
}

/**
 * Check if a user can send a message (has free prompts or enough tokens)
 */
export async function canUserSendMessage(userId: string) {
  const tokenData = await getUserTokenBalance(userId);

  // Check if user has free prompts remaining
  if (tokenData.free_prompts_used < FREE_PROMPTS_LIMIT) {
    return {
      canSend: true,
      freePrompt: true,
      remainingFree: FREE_PROMPTS_LIMIT - tokenData.free_prompts_used,
    };
  }

  // Check if user has enough tokens
  if (tokenData.balance >= TOKENS_PER_PROMPT) {
    return {
      canSend: true,
      freePrompt: false,
      tokenBalance: tokenData.balance,
    };
  }

  // User cannot send a message
  return { canSend: false, freePrompt: false, tokenBalance: tokenData.balance };
}

/**
 * Record token usage for a message
 */
export async function recordMessageTokenUsage(userId: string) {
  const supabase = await createClient();
  const tokenData = await getUserTokenBalance(userId);

  // Check if user still has free prompts
  if (tokenData.free_prompts_used < FREE_PROMPTS_LIMIT) {
    // Update free prompts used
    const { error } = await supabase
      .from("tokens")
      .update({
        free_prompts_used: tokenData.free_prompts_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating free prompts used:", error);
      throw error;
    }

    // Record transaction
    await supabase.from("token_transactions").insert({
      user_id: userId,
      amount: 0, // No tokens used for free prompts
      transaction_type: "usage",
      description: `Free prompt used (${tokenData.free_prompts_used + 1}/${FREE_PROMPTS_LIMIT})`,
    });

    return {
      freePrompt: true,
      remainingFree: FREE_PROMPTS_LIMIT - (tokenData.free_prompts_used + 1),
    };
  }

  // Use tokens
  const { error } = await supabase
    .from("tokens")
    .update({
      balance: tokenData.balance - TOKENS_PER_PROMPT,
      total_used: tokenData.total_used + TOKENS_PER_PROMPT,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating token balance:", error);
    throw error;
  }

  // Record transaction
  await supabase.from("token_transactions").insert({
    user_id: userId,
    amount: -TOKENS_PER_PROMPT,
    transaction_type: "usage",
    description: "Token used for AI message",
  });

  return {
    freePrompt: false,
    tokenBalance: tokenData.balance - TOKENS_PER_PROMPT,
  };
}

/**
 * Add tokens to a user's balance from a purchase
 */
export async function addTokensFromPurchase(
  userId: string,
  amountInCents: number,
) {
  const supabase = await createClient();
  const tokenData = await getUserTokenBalance(userId);

  // Calculate tokens to add (10 tokens per dollar)
  const tokensToAdd = Math.floor((amountInCents / 100) * 10);

  // Update token balance
  const { error } = await supabase
    .from("tokens")
    .update({
      balance: tokenData.balance + tokensToAdd,
      total_purchased: tokenData.total_purchased + tokensToAdd,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error adding tokens from purchase:", error);
    throw error;
  }

  // Record transaction
  await supabase.from("token_transactions").insert({
    user_id: userId,
    amount: tokensToAdd,
    transaction_type: "purchase",
    description: `Purchased ${tokensToAdd} tokens ($${amountInCents / 100})`,
  });

  return {
    tokensAdded: tokensToAdd,
    newBalance: tokenData.balance + tokensToAdd,
  };
}
