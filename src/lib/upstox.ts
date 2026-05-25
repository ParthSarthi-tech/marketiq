const UPSTOX_ACCESS_TOKEN = import.meta.env.VITE_UPSTOX_ACCESS_TOKEN;
const UPSTOX_BASE_URL = "https://api.upstox.com/v3";
const UPSTOX_V2_URL = "https://api.upstox.com/v2";

const CACHE_DURATION = 30000;
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${UPSTOX_ACCESS_TOKEN}`,
  };
}

async function upstoxFetch<T>(url: string, cacheKey?: string): Promise<T> {
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  const response = await fetch(url, { headers: getHeaders() });

  if (response.status === 429) {
    await new Promise((r) => setTimeout(r, 1000));
    return upstoxFetch<T>(url, cacheKey);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Upstox API error: ${response.status} — ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  if (cacheKey) setCache(cacheKey, data);
  return data as T;
}

export interface LTPCData {
  ltp: number;
  ltt: number;
  ltq: number;
  cp: number;
}

export interface StockQuote {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  v: number;
}

export type FinnhubQuote = StockQuote;

export interface OHLCData {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface HistoricalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface InstrumentSearchResult {
  instrument_key: string;
  exchange: string;
  trading_symbol: string;
  name: string;
  short_name: string;
  isin: string;
  exchange_token: string;
  segment: string;
  instrument_type: string;
}

export interface MarketStatus {
  exchange: string;
  market_type: string;
  status: string;
  trade_date: string;
  segment: string;
}

export interface LTPV3Response {
  status: string;
  data: Record<string, {
    last_price: number;
    instrument_token: string;
    ltq?: number;
    volume?: number;
    cp?: number;
  }>;
}

export interface OHLCV3Response {
  status: string;
  data: Record<string, {
    ohlc: {
      open: number;
      high: number;
      low: number;
      close: number;
    };
    depth?: {
      buy: Array<{ price: number; quantity: number }>;
      sell: Array<{ price: number; quantity: number }>;
    };
  }>;
}

export interface HistoricalCandleResponse {
  status: string;
  data: {
    candles: [string, number, number, number, number, number, number?][];
  };
}

export interface SearchResponse {
  status: string;
  data: InstrumentSearchResult[];
  meta_data?: {
    page: { page_number: number; total_pages: number; records: number; total_records: number };
  };
}

export interface MarketStatusResponse {
  status: string;
  data: MarketStatus[];
}

export interface FullQuoteDepth {
  buy: Array<{ quantity: number; price: number; orders: number }>;
  sell: Array<{ quantity: number; price: number; orders: number }>;
}

export interface FullQuoteOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface FullQuote {
  ohlc: FullQuoteOHLC;
  depth: FullQuoteDepth;
  timestamp: string;
  instrument_token: string;
  symbol: string;
  last_price: number;
  volume: number;
  average_price: number;
  oi: number;
  net_change: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  lower_circuit_limit: number;
  upper_circuit_limit: number;
  last_trade_time: string;
  oi_day_high: number;
  oi_day_low: number;
}

export interface FullQuoteResponse {
  status: string;
  data: Record<string, FullQuote>;
}

function parseLTPResponse(
  data: LTPV3Response,
  instrumentKeys: string[]
): StockQuote[] {
  const quotes: StockQuote[] = [];

  const responseKeys = Object.keys(data.data || {});
  console.log("[parseLTPResponse] Response has keys:", responseKeys.slice(0, 5));

  for (const key of instrumentKeys) {
    const inputSymbol = extractSymbolFromKey(key);
    
    let entry = data.data[key];
    
    if (!entry) {
      const matchedKey = responseKeys.find(rk => {
        const rkSymbol = rk.includes(":") ? rk.split(":")[1] : "";
        return rkSymbol.toUpperCase() === inputSymbol.toUpperCase();
      });
      if (matchedKey) {
        entry = data.data[matchedKey];
        console.log("[parseLTPResponse] Found match:", matchedKey, "for input:", key);
      }
    }

    if (!entry) continue;

    const symbol = extractSymbolFromKey(key);
    const change = entry.cp ? entry.last_price - entry.cp : 0;
    const changePercent = entry.cp ? (change / entry.cp) * 100 : 0;

    quotes.push({
      symbol,
      lastPrice: entry.last_price,
      change,
      changePercent,
      open: entry.last_price,
      high: entry.last_price,
      low: entry.last_price,
      close: entry.cp || entry.last_price,
      volume: entry.volume || 0,
      timestamp: Date.now(),
      c: entry.last_price,
      d: change,
      dp: changePercent,
      h: entry.last_price,
      l: entry.last_price,
      o: entry.last_price,
      pc: entry.cp || entry.last_price,
      v: entry.volume || 0,
    });
  }

  return quotes;
}

function extractSymbolFromKey(key: string): string {
  if (key.startsWith("NSE_INDEX|") || key.startsWith("NSE_INDEX:")) {
    const indexName = key.replace("NSE_INDEX|", "").replace("NSE_INDEX:", "");
    return `INDEX:${indexName}`;
  }
  if (key.includes("|")) {
    const parts = key.split("|");
    return parts[parts.length - 1];
  }
  if (key.includes(":")) {
    const parts = key.split(":");
    return parts[parts.length - 1];
  }
  return key;
}

import { getResolvedKeyBySymbol } from "./instrumentResolver";

const BATCH_SIZE = 5;

async function fetchQuoteChunk(
  chunk: string[]
): Promise<Record<string, StockQuote>> {
  const keysParam = chunk.map((k) => encodeURIComponent(k)).join(",");
  const url = `${UPSTOX_V2_URL}/market-quote/quotes?instrument_key=${keysParam}`;

  const cacheKey = `fullquote_chunk_${chunk.slice(0, 3).join("_")}`;
  const data = await upstoxFetch<FullQuoteResponse>(url, cacheKey);

  const result: Record<string, StockQuote> = {};

  for (const [responseKey, quote] of Object.entries(data.data || {})) {
    const symbol = quote.symbol;
    const originalKey = getResolvedKeyBySymbol(symbol);

    if (originalKey) {
      const change = quote.net_change || 0;
      const close = quote.ohlc?.close || quote.last_price - change;
      const changePercent = close ? (change / close) * 100 : 0;

      result[originalKey] = {
        symbol,
        lastPrice: quote.last_price,
        change,
        changePercent,
        high: quote.ohlc?.high || quote.last_price,
        low: quote.ohlc?.low || quote.last_price,
        open: quote.ohlc?.open || quote.last_price,
        close,
        volume: quote.volume,
      };
    }
  }

  return result;
}

export async function getQuotesBatch(
  instrumentKeys: string[]
): Promise<Record<string, StockQuote>> {
  if (instrumentKeys.length === 0) return {};

  console.log("[getQuotesBatch] Total keys:", instrumentKeys.length);

  const chunks: string[][] = [];
  for (let i = 0; i < instrumentKeys.length; i += BATCH_SIZE) {
    chunks.push(instrumentKeys.slice(i, i + BATCH_SIZE));
  }

  console.log("[getQuotesBatch] Splitting into", chunks.length, "batches of", BATCH_SIZE);

  const results = await Promise.all(chunks.map(fetchQuoteChunk));

  const merged: Record<string, StockQuote> = {};
  for (const r of results) {
    Object.assign(merged, r);
  }

  console.log("[getQuotesBatch] Merged result keys:", Object.keys(merged).length);
  return merged;
}

export async function getStockQuote(
  instrumentKey: string,
  tickerSymbol?: string
): Promise<StockQuote | null> {
  try {
    const url = `${UPSTOX_V2_URL}/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKey)}`;
    const data = await upstoxFetch<FullQuoteResponse>(url, `quote_${instrumentKey}`);

    const searchSymbol = tickerSymbol || extractSymbolFromKey(instrumentKey);
    const resolvedKey = getResolvedKeyBySymbol(searchSymbol);

    let entry: FullQuote | undefined;

    if (resolvedKey && data.data?.[resolvedKey]) {
      entry = data.data[resolvedKey];
    }

    if (!entry) {
      for (const [key, val] of Object.entries(data.data || {})) {
        const symbolFromKey = key.split(':')[1];
        if (symbolFromKey === searchSymbol) {
          entry = val;
          break;
        }
      }
    }

    if (!entry) return null;

    const symbol = entry.symbol || searchSymbol;
    const change = entry.net_change || 0;
    const close = entry.ohlc?.close || entry.last_price - change;
    const changePercent = close ? (change / close) * 100 : 0;

    return {
      symbol,
      lastPrice: entry.last_price,
      change,
      changePercent,
      open: entry.ohlc?.open || entry.last_price,
      high: entry.ohlc?.high || entry.last_price,
      low: entry.ohlc?.low || entry.last_price,
      close,
      volume: entry.volume,
      timestamp: Date.now(),
      c: entry.last_price,
      d: change,
      dp: changePercent,
      h: entry.ohlc?.high || entry.last_price,
      l: entry.ohlc?.low || entry.last_price,
      o: entry.ohlc?.open || entry.last_price,
      pc: close,
      v: entry.volume,
    };
  } catch (e) {
    console.error(`Failed to fetch quote for ${instrumentKey}:`, e);
    return null;
  }
}

export async function getIndexQuote(
  indexKey: string
): Promise<StockQuote | null> {
  return getStockQuote(indexKey);
}

export async function getStockOHLC(
  instrumentKey: string,
  interval: "1day" | "30minute" | "1minute" = "1day"
): Promise<OHLCData | null> {
  try {
    const intervalMap: Record<string, string> = {
      "1day": "1d",
      "30minute": "I30",
      "1minute": "I1",
    };

    const intervalValue = intervalMap[interval] || "1d";
    const url = `${UPSTOX_BASE_URL}/market-quote/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}&interval=${intervalValue}`;
    const data = await upstoxFetch<OHLCV3Response>(url, `ohlc_${instrumentKey}_${intervalValue}`);

    const entry = data.data[instrumentKey];
    if (!entry || !entry.ohlc) return null;

    return {
      symbol: extractSymbolFromKey(instrumentKey),
      open: entry.ohlc.open,
      high: entry.ohlc.high,
      low: entry.ohlc.low,
      close: entry.ohlc.close,
      volume: 0,
      timestamp: Date.now(),
    };
  } catch (e) {
    console.error(`Failed to fetch OHLC for ${instrumentKey}:`, e);
    return null;
  }
}

export async function getHistoricalCandles(
  instrumentKey: string,
  toDate: string,
  fromDate?: string,
  interval: "1minute" | "30minute" | "1day" | "1week" | "1month" = "1day"
): Promise<HistoricalCandle[]> {
  try {
    const intervalMap: Record<string, { unit: string; interval: string }> = {
      "1minute": { unit: "minutes", interval: "1" },
      "30minute": { unit: "minutes", interval: "30" },
      "1day": { unit: "days", interval: "1" },
      "1week": { unit: "weeks", interval: "1" },
      "1month": { unit: "months", interval: "1" },
    };

    const { unit, interval: intervalValue } = intervalMap[interval] || { unit: "days", interval: "1" };

    let url = `${UPSTOX_BASE_URL}/historical-candle/${encodeURIComponent(instrumentKey)}/${unit}/${intervalValue}/${toDate}`;
    if (fromDate) {
      url += `/${fromDate}`;
    }

    const data = await upstoxFetch<HistoricalCandleResponse>(url, `hist_${instrumentKey}_${unit}_${intervalValue}_${toDate}`);

    if (!data.data?.candles) return [];

    return data.data.candles.map((candle) => ({
      timestamp: new Date(candle[0]).getTime(),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
  } catch (e) {
    console.error(`Failed to fetch historical candles for ${instrumentKey}:`, e);
    return [];
  }
}

export async function searchInstruments(
  query: string,
  exchange: "NSE" | "BSE" | "MCX" | "ALL" = "NSE",
  segment?: "EQ" | "FO" | "CURR" | "COMM" | "INDEX" | "OPT" | "FUT" | "ALL",
  instrumentType?: "CE" | "PE" | "EQ" | "FUT" | "OPT",
  expiry?: string,
  atmOffset?: number,
  pageNumber: number = 1,
  records: number = 20
): Promise<InstrumentSearchResult[]> {
  try {
    const params = new URLSearchParams();
    params.set("query", query);
    if (exchange) params.set("exchanges", exchange);
    if (segment) params.set("segments", segment);
    if (instrumentType) params.set("instrument_types", instrumentType);
    if (expiry) params.set("expiry", expiry);
    if (atmOffset !== undefined) params.set("atm_offset", atmOffset.toString());
    params.set("page_number", pageNumber.toString());
    params.set("records", records.toString());

    const url = `${UPSTOX_V2_URL}/instruments/search?${params.toString()}`;
    const data = await upstoxFetch<SearchResponse>(url, `search_${query}_${exchange}`);

    return data.data || [];
  } catch (e) {
    console.error(`Failed to search instruments for ${query}:`, e);
    return [];
  }
}

export async function getMarketStatus(
  exchange: "NSE" | "BSE" | "MCX" = "NSE"
): Promise<MarketStatus | null> {
  try {
    const url = `${UPSTOX_V2_URL}/market-status?exchange=${exchange}`;
    const data = await upstoxFetch<MarketStatusResponse>(url, `status_${exchange}`);

    return data.data?.[0] || null;
  } catch (e) {
    console.error(`Failed to fetch market status for ${exchange}:`, e);
    return null;
  }
}

export async function getFullQuotes(
  instrumentKeys: string[]
): Promise<Record<string, FullQuote>> {
  if (instrumentKeys.length === 0) return {};

  const keysParam = instrumentKeys.map((k) => encodeURIComponent(k)).join(",");
  const url = `${UPSTOX_V2_URL}/market-quote/quotes?instrument_key=${keysParam}`;

  const cacheKey = `fullquote_batch_${instrumentKeys.slice(0, 5).join("_")}`;
  const data = await upstoxFetch<FullQuoteResponse>(url, cacheKey);

  return data.data || {};
}

export async function getFullQuote(
  instrumentKey: string
): Promise<FullQuote | null> {
  try {
    const quotes = await getFullQuotes([instrumentKey]);
    return quotes[instrumentKey] || null;
  } catch (e) {
    console.error(`Failed to fetch full quote for ${instrumentKey}:`, e);
    return null;
  }
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const istHour = (now.getUTCHours() + 5.5 + 24) % 24;
  const day = now.getUTCDay();

  if (day === 0 || day === 6) return false;
  if (istHour < 9.25 || istHour >= 15.5) return false;

  return true;
}

export function isMarketPreOpen(): boolean {
  const now = new Date();
  const istHour = (now.getUTCHours() + 5.5 + 24) % 24;
  const day = now.getUTCDay();

  if (day === 0 || day === 6) return false;
  if (istHour >= 9.0 && istHour < 9.25) return true;

  return false;
}

export async function getWebSocketAuthUrl(): Promise<string | null> {
  try {
    const url = `${UPSTOX_BASE_URL}/feed/market-data-feed/authorize`;
    const headers = {
      ...getHeaders(),
      Accept: "application/json",
    };
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`WebSocket auth failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data?.authorized_redirect_uri || null;
  } catch (e) {
    console.error("Failed to get WebSocket auth URL:", e);
    return null;
  }
}

export { clearCache };