import { searchInstruments, type InstrumentSearchResult } from "./upstox";
import { STOCK_CONFIG } from "./stockMetadata";

const RESOLVED_KEYS: Record<string, string> = {};
const SYMBOL_TO_KEY: Record<string, string> = {};
let initialized = false;

const SEARCH_QUERIES: Record<string, string> = {
  INFY: "INFOSYS",
  HDFCBANK: "HDFC BANK",
  RELIANCE: "RELIANCE",
  TCS: "TCS",
  ITC: "ITC",
  LTFOODS: "LT FOODS",
  SBIN: "SBI",
  BAJFINANCE: "BAJAJ FINANCE",
  TITAN: "TITAN",
  ADANIPORTS: "ADANI PORTS",
  SUNPHARMA: "SUNPHARMA",
  BHARTIARTL: "BHARTI AIRTEL",
  AXISBANK: "AXIS BANK",
  KOTAKBANK: "KOTAK MAHINDRA BANK",
  MARUTI: "MARUTI SUZUKI",
  HINDUNILVR: "HINDUSTAN UNILEVER",
  ICICIBANK: "ICICI BANK",
  ASIANPAINT: "ASIAN PAINTS",
  WIPRO: "WIPRO",
};

export async function resolveTickerToInstrumentKey(
  ticker: string
): Promise<string | null> {
  if (RESOLVED_KEYS[ticker]) {
    return RESOLVED_KEYS[ticker];
  }

  const query = SEARCH_QUERIES[ticker];
  if (!query) return null;

  const results = await searchInstruments(query, "NSE");

  const exactMatch = results.find(
    (r) =>
      r.trading_symbol.toUpperCase() === ticker ||
      r.name.toUpperCase().includes(query.toUpperCase())
  );

  if (exactMatch && exactMatch.segment === "NSE_EQ") {
    console.log(`[InstrumentResolver] Raw instrument_key from search: ${exactMatch.instrument_key}`);
    RESOLVED_KEYS[ticker] = exactMatch.instrument_key;
    SYMBOL_TO_KEY[exactMatch.trading_symbol] = exactMatch.instrument_key;
    console.log(`[InstrumentResolver] ${ticker} → ${exactMatch.instrument_key}`);
    return exactMatch.instrument_key;
  }

  const fallback = results.find((r) => r.segment === "NSE_EQ");
  if (fallback) {
    console.log(`[InstrumentResolver] Raw instrument_key from search: ${fallback.instrument_key}`);
    RESOLVED_KEYS[ticker] = fallback.instrument_key;
    SYMBOL_TO_KEY[fallback.trading_symbol] = fallback.instrument_key;
    console.log(`[InstrumentResolver] ${ticker} → ${fallback.instrument_key}`);
    return fallback.instrument_key;
  }

  return null;
}

export async function resolveAllInstrumentKeys(): Promise<Record<string, string>> {
  if (initialized) return RESOLVED_KEYS;

  const tickers = Object.keys(STOCK_CONFIG);
  const results: Record<string, string> = {};

  console.log("[InstrumentResolver] Resolving instrument keys for", tickers.length, "stocks...");

  for (const ticker of tickers) {
    try {
      const key = await resolveTickerToInstrumentKey(ticker);
      if (key) {
        results[ticker] = key;
        console.log(`[InstrumentResolver] ${ticker} → ${key}`);
      } else {
        console.warn(`[InstrumentResolver] Could not resolve: ${ticker}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(`[InstrumentResolver] Error resolving ${ticker}:`, e);
    }
  }

  initialized = true;
  console.log(
    "[InstrumentResolver] Resolved",
    Object.keys(results).length,
    "/",
    tickers.length,
    "stocks"
  );

  return results;
}

export function getResolvedKey(ticker: string): string | null {
  return RESOLVED_KEYS[ticker] || null;
}

export function getAllResolvedKeys(): Record<string, string> {
  return { ...RESOLVED_KEYS };
}

export function getResolvedKeyBySymbol(symbol: string): string | null {
  return SYMBOL_TO_KEY[symbol] || null;
}

export function isResolved(ticker: string): boolean {
  return !!RESOLVED_KEYS[ticker];
}

export function getInstrumentKeyForIndex(indexName: string): string {
  const indexMap: Record<string, string> = {
    "Nifty 50": "NSE_INDEX|Nifty 50",
    "Nifty Bank": "NSE_INDEX|Nifty Bank",
    "Nifty IT": "NSE_INDEX|Nifty IT",
    "Nifty FMCG": "NSE_INDEX|Nifty FMCG",
  };
  return indexMap[indexName] || `NSE_INDEX|${indexName}`;
}

export function resolveSearchResult(
  result: InstrumentSearchResult
): { symbol: string; name: string; instrumentKey: string } | null {
  if (result.segment !== "NSE_EQ" && result.segment !== "BSE_EQ") {
    return null;
  }

  return {
    symbol: result.trading_symbol,
    name: result.name,
    instrumentKey: result.instrument_key,
  };
}