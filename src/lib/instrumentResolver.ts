import { searchInstruments, type InstrumentSearchResult } from "./upstox";
import { STOCK_CONFIG } from "./stockMetadata";
import { getKnownKey, setKnownKey, setKnownKeys } from "./knownInstrumentKeys";
import { loadAllCachedKeys, saveCachedKeys, saveCachedKey } from "./instrumentCache";

const RESOLVED_KEYS: Record<string, string> = {};
const SYMBOL_TO_KEY: Record<string, string> = {};
let initialized = false;
let cacheHydrated = false;

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

const SEARCH_CONCURRENCY = 3;
const RATE_LIMIT_BACKOFF_MS = 1500;

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function hydrateCacheFromSupabase(): Promise<void> {
  if (cacheHydrated) return;
  cacheHydrated = true;

  try {
    const cached = await loadAllCachedKeys();
    if (Object.keys(cached).length === 0) return;

    for (const [ticker, key] of Object.entries(cached)) {
      RESOLVED_KEYS[ticker] = key;
    }
  } catch (e) {
    console.warn("[InstrumentResolver] Cache hydration failed, falling back to search:", e);
  }
}

function hydrateFromKnownKeys(): void {
  const tickers = Object.keys(STOCK_CONFIG);
  for (const ticker of tickers) {
    const known = getKnownKey(ticker);
    if (known && !RESOLVED_KEYS[ticker]) {
      RESOLVED_KEYS[ticker] = known;
    }
  }
}

export async function resolveTickerToInstrumentKey(ticker: string): Promise<string | null> {
  if (RESOLVED_KEYS[ticker]) {
    return RESOLVED_KEYS[ticker];
  }

  const known = getKnownKey(ticker);
  if (known) {
    RESOLVED_KEYS[ticker] = known;
    return known;
  }

  const query = SEARCH_QUERIES[ticker] || ticker;
  let results: InstrumentSearchResult[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      results = await searchInstruments(query, "NSE");
      break;
    } catch (e) {
      const errMsg = String(e);
      if (errMsg.includes("UDAPI10005") || errMsg.includes("429")) {
        if (attempt === 0) {
          await delay(RATE_LIMIT_BACKOFF_MS);
          continue;
        }
      }
      return resolveAnyKey(ticker);
    }
  }

  const exactMatch = results.find(
    (r) =>
      r.trading_symbol.toUpperCase() === ticker ||
      r.name.toUpperCase().includes(query.toUpperCase()),
  );

  if (exactMatch && exactMatch.segment === "NSE_EQ") {
    RESOLVED_KEYS[ticker] = exactMatch.instrument_key;
    SYMBOL_TO_KEY[exactMatch.trading_symbol] = exactMatch.instrument_key;
    setKnownKey(ticker, exactMatch.instrument_key);
    saveCachedKey(ticker, exactMatch.instrument_key, exactMatch.trading_symbol, exactMatch.name);
    return exactMatch.instrument_key;
  }

  const fallback = results.find((r) => r.segment === "NSE_EQ");
  if (fallback) {
    RESOLVED_KEYS[ticker] = fallback.instrument_key;
    SYMBOL_TO_KEY[fallback.trading_symbol] = fallback.instrument_key;
    setKnownKey(ticker, fallback.instrument_key);
    saveCachedKey(ticker, fallback.instrument_key, fallback.trading_symbol, fallback.name);
    return fallback.instrument_key;
  }

  return resolveAnyKey(ticker);
}

export async function resolveAllInstrumentKeys(): Promise<Record<string, string>> {
  if (initialized && Object.keys(RESOLVED_KEYS).length > 0) return RESOLVED_KEYS;

  hydrateFromKnownKeys();

  await hydrateCacheFromSupabase();

  const tickers = Object.keys(STOCK_CONFIG);
  const unresolved = tickers.filter((t) => !RESOLVED_KEYS[t]);

  if (unresolved.length > 0) {
    const newEntries: Array<{
      ticker: string;
      instrumentKey: string;
      tradingSymbol: string;
      name: string;
    }> = [];
    const queue = [...unresolved];

    async function worker(): Promise<void> {
      while (queue.length > 0) {
        const ticker = queue.shift()!;
        try {
          let key = await resolveTickerToInstrumentKey(ticker);
          if (!key) {
            key = await resolveAnyKey(ticker);
          }
          if (key) {
            RESOLVED_KEYS[ticker] = key;
            newEntries.push({
              ticker,
              instrumentKey: key,
              tradingSymbol: ticker,
              name: STOCK_CONFIG[ticker]?.name ?? ticker,
            });
          } else {
            console.warn(`[InstrumentResolver] Could not resolve: ${ticker}`);
          }
        } catch (e) {
          console.error(`[InstrumentResolver] Error resolving ${ticker}:`, e);
        }
      }
    }

    const workers = Array.from({ length: SEARCH_CONCURRENCY }, () => worker());
    await Promise.all(workers);

    if (newEntries.length > 0) {
      saveCachedKeys(newEntries);
      for (const e of newEntries) {
        setKnownKey(e.ticker, e.instrumentKey);
      }
    }
  }

  initialized = true;
  return { ...RESOLVED_KEYS };
}

export function getResolvedKey(ticker: string): string | null {
  return RESOLVED_KEYS[ticker] ?? getKnownKey(ticker) ?? null;
}

export function getAllResolvedKeys(): Record<string, string> {
  return { ...RESOLVED_KEYS };
}

export function getResolvedKeyBySymbol(symbol: string): string | null {
  return SYMBOL_TO_KEY[symbol] ?? null;
}

export function isResolved(ticker: string): boolean {
  return ticker in RESOLVED_KEYS || getKnownKey(ticker) !== null;
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

export async function resolveAnyKey(ticker: string): Promise<string | null> {
  if (RESOLVED_KEYS[ticker]) {
    return RESOLVED_KEYS[ticker];
  }

  const known = getKnownKey(ticker);
  if (known) {
    RESOLVED_KEYS[ticker] = known;
    return known;
  }

  let results: InstrumentSearchResult[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      results = await searchInstruments(ticker, "NSE");
      break;
    } catch (e) {
      const errMsg = String(e);
      if ((errMsg.includes("UDAPI10005") || errMsg.includes("429")) && attempt === 0) {
        await delay(RATE_LIMIT_BACKOFF_MS);
        continue;
      }
      return null;
    }
  }

  const eqMatch = results.find(
    (r) => r.trading_symbol.toUpperCase() === ticker.toUpperCase() && r.segment === "NSE_EQ",
  );

  if (eqMatch) {
    RESOLVED_KEYS[ticker] = eqMatch.instrument_key;
    SYMBOL_TO_KEY[eqMatch.trading_symbol] = eqMatch.instrument_key;
    setKnownKey(ticker, eqMatch.instrument_key);
    saveCachedKey(ticker, eqMatch.instrument_key, eqMatch.trading_symbol, eqMatch.name);
    return eqMatch.instrument_key;
  }

  const fallback = results.find((r) => r.segment === "NSE_EQ");
  if (fallback) {
    RESOLVED_KEYS[ticker] = fallback.instrument_key;
    SYMBOL_TO_KEY[fallback.trading_symbol] = fallback.instrument_key;
    setKnownKey(ticker, fallback.instrument_key);
    saveCachedKey(ticker, fallback.instrument_key, fallback.trading_symbol, fallback.name);
    return fallback.instrument_key;
  }

  return null;
}

export function resolveSearchResult(
  result: InstrumentSearchResult,
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
