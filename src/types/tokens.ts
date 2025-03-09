export interface TokenBalance {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  free_prompts_used: number;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "purchase" | "usage" | "refund" | "bonus";
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const FREE_PROMPTS_LIMIT = 3;
export const TOKENS_PER_PROMPT = 1;
export const TOKENS_PER_DOLLAR = 10;
