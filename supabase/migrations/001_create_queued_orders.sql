-- Create queued_orders table for market-closed order queuing
-- Orders placed outside trading hours are stored here
-- and automatically executed when the market opens.

CREATE TABLE IF NOT EXISTS queued_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
  total_cost DECIMAL(14, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'executed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_queued_orders_user_id ON queued_orders (user_id);

-- Index for finding pending orders to execute
CREATE INDEX IF NOT EXISTS idx_queued_orders_status ON queued_orders (status);

-- Enable Row Level Security
ALTER TABLE queued_orders ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON queued_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON queued_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own orders (for cancel)
CREATE POLICY "Users can update own orders"
  ON queued_orders FOR UPDATE
  USING (auth.uid() = user_id);
