-- Create instrument_keys table for caching Upstox instrument key resolution
-- This avoids rate-limiting issues from resolving all tickers on every load

CREATE TABLE IF NOT EXISTS instrument_keys (
  ticker TEXT PRIMARY KEY,
  instrument_key TEXT NOT NULL,
  trading_symbol TEXT,
  name TEXT,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup by instrument_key (for reverse mapping)
CREATE INDEX IF NOT EXISTS idx_instrument_keys_instrument_key ON instrument_keys (instrument_key);

-- Allow public read since this is public market data
ALTER TABLE instrument_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read instrument_keys"
  ON instrument_keys FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert instrument_keys"
  ON instrument_keys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update instrument_keys"
  ON instrument_keys FOR UPDATE
  USING (true);

-- Upsert helper function
CREATE OR REPLACE FUNCTION upsert_instrument_key(
  p_ticker TEXT,
  p_instrument_key TEXT,
  p_trading_symbol TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO instrument_keys (ticker, instrument_key, trading_symbol, name, resolved_at)
  VALUES (p_ticker, p_instrument_key, p_trading_symbol, p_name, now())
  ON CONFLICT (ticker)
  DO UPDATE SET
    instrument_key = EXCLUDED.instrument_key,
    trading_symbol = COALESCE(EXCLUDED.trading_symbol, instrument_keys.trading_symbol),
    name = COALESCE(EXCLUDED.name, instrument_keys.name),
    resolved_at = now();
END;
$$ LANGUAGE plpgsql;
