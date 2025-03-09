-- Create tokens table to track user token balances
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  free_prompts_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create token_transactions table to track token history
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON tokens;
CREATE POLICY "Users can view their own tokens"
  ON tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can update tokens
DROP POLICY IF EXISTS "Service role can update tokens" ON tokens;
CREATE POLICY "Service role can update tokens"
  ON tokens FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Users can only view their own transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON token_transactions;
CREATE POLICY "Users can view their own transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert transactions
DROP POLICY IF EXISTS "Service role can insert transactions" ON token_transactions;
CREATE POLICY "Service role can insert transactions"
  ON token_transactions FOR INSERT
  WITH CHECK (auth.jwt() ? 'service_role');

-- Enable realtime for tokens table
alter publication supabase_realtime add table tokens;
alter publication supabase_realtime add table token_transactions;
