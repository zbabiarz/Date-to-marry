"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import { Coins } from "lucide-react";
import { FREE_PROMPTS_LIMIT } from "@/types/tokens";

export default function TokenDisplay() {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [freePromptsUsed, setFreePromptsUsed] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("tokens")
          .select("balance, free_prompts_used")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setTokenBalance(data.balance);
          setFreePromptsUsed(data.free_prompts_used);
        } else {
          // If no record exists, user has 0 tokens and 0 free prompts used
          setTokenBalance(0);
          setFreePromptsUsed(0);
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalance();

    // Subscribe to changes in the tokens table
    const subscription = supabase
      .channel("tokens-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tokens",
        },
        (payload) => {
          setTokenBalance(payload.new.balance);
          setFreePromptsUsed(payload.new.free_prompts_used);
        },
      )
      .subscribe();

    // Subscribe to token transactions to ensure UI updates immediately
    const transactionSubscription = supabase
      .channel("token-transactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_transactions",
        },
        async (payload) => {
          // When a new transaction is recorded, refresh the token data
          fetchTokenBalance();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      transactionSubscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Coins className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const freePromptsRemaining = FREE_PROMPTS_LIMIT - (freePromptsUsed || 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1 rounded-md">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{tokenBalance}</span>
        <span className="text-xs">tokens</span>
      </div>

      {freePromptsRemaining > 0 && (
        <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
          <span className="font-medium">{freePromptsRemaining}</span> free{" "}
          {freePromptsRemaining === 1 ? "credit" : "credits"} left
        </div>
      )}
    </div>
  );
}
