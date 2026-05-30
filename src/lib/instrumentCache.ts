import { supabase } from "./supabase";

type InstrumentKeyRow = {
  ticker: string;
  instrument_key: string;
  trading_symbol: string | null;
  name: string | null;
  resolved_at: string;
};

export async function loadAllCachedKeys(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from("instrument_keys").select("ticker, instrument_key");

    if (error) {
      console.warn("[InstrumentCache] Failed to load cached keys:", error.message);
      return {};
    }

    const result: Record<string, string> = {};
    for (const row of data ?? []) {
      result[row.ticker] = row.instrument_key;
    }
    return result;
  } catch (e) {
    console.warn("[InstrumentCache] Error loading cached keys:", e);
    return {};
  }
}

export async function loadCachedKey(ticker: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("instrument_keys")
      .select("instrument_key")
      .eq("ticker", ticker)
      .maybeSingle();

    if (error || !data) return null;
    return data.instrument_key;
  } catch {
    return null;
  }
}

export async function saveCachedKey(
  ticker: string,
  instrumentKey: string,
  tradingSymbol?: string,
  name?: string,
): Promise<void> {
  try {
    await supabase.from("instrument_keys").upsert(
      {
        ticker,
        instrument_key: instrumentKey,
        trading_symbol: tradingSymbol ?? null,
        name: name ?? null,
        resolved_at: new Date().toISOString(),
      },
      { onConflict: "ticker" },
    );
  } catch (e) {
    console.warn(`[InstrumentCache] Failed to save key for ${ticker}:`, e);
  }
}

export async function saveCachedKeys(
  entries: Array<{ ticker: string; instrumentKey: string; tradingSymbol?: string; name?: string }>,
): Promise<void> {
  if (entries.length === 0) return;

  const BATCH_SIZE = 50;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE).map((e) => ({
      ticker: e.ticker,
      instrument_key: e.instrumentKey,
      trading_symbol: e.tradingSymbol ?? null,
      name: e.name ?? null,
      resolved_at: new Date().toISOString(),
    }));

    try {
      await supabase.from("instrument_keys").upsert(batch, { onConflict: "ticker" });
    } catch (e) {
      console.warn(`[InstrumentCache] Failed to save batch starting at ${i}:`, e);
    }
  }
}
