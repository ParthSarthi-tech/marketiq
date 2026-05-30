import { createServerFn } from "@tanstack/react-start";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

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

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status !== 429) return response;

    const backoff = Math.min(1000 * Math.pow(2, attempt), 8000);
    console.warn(
      `[UpstoxProxy] 429 rate limited, retrying in ${backoff}ms (attempt ${attempt + 1}/${maxRetries})`,
    );
    await new Promise((r) => setTimeout(r, backoff));
  }

  return fetch(url, options);
}

function getServerToken(): string {
  const token =
    process.env.UPSTOX_ACCESS_TOKEN ||
    (process.env as Record<string, string>)["VITE_UPSTOX_ACCESS_TOKEN"] ||
    "";
  return token;
}

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${getServerToken()}`,
  };
}

export const proxyGetQuotesBatch = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as { instrumentKeys: string[] })
  .handler(async (ctx) => {
    const { instrumentKeys } = ctx.data;
    if (instrumentKeys.length === 0) return {};

    const BATCH_SIZE = 5;
    const chunks: string[][] = [];
    for (let i = 0; i < instrumentKeys.length; i += BATCH_SIZE) {
      chunks.push(instrumentKeys.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const keysParam = chunk.map((k) => encodeURIComponent(k)).join(",");
        const cacheKey = `proxy_quote_${chunk.slice(0, 3).join("_")}`;

        const cached = getCached<Json>(cacheKey);
        if (cached) return cached;

        const url = `${UPSTOX_V2_URL}/market-quote/quotes?instrument_key=${keysParam}`;
        const response = await fetchWithRetry(url, { headers: getHeaders() });
        if (!response.ok) return {};
        const data = await response.json();
        const result = (data as { data?: Json }).data || {};
        setCache(cacheKey, result);
        return result;
      }),
    );

    const merged: Record<string, Json> = {};
    for (const r of results) {
      Object.assign(merged, r);
    }
    return merged;
  });

export const proxyGetStockQuote = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as { instrumentKey: string; tickerSymbol?: string })
  .handler(async (ctx) => {
    const { instrumentKey } = ctx.data;
    const cacheKey = `proxy_single_quote_${instrumentKey}`;
    const cached = getCached<Json>(cacheKey);
    if (cached) return cached;

    const url = `${UPSTOX_V2_URL}/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKey)}`;
    const response = await fetchWithRetry(url, { headers: getHeaders() });
    if (!response.ok) return null;
    const data = await response.json();
    const result = (data as { data?: Json }).data || null;
    if (result) setCache(cacheKey, result);
    return result;
  });

export const proxySearchInstruments = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as { query: string; exchange: string })
  .handler(async (ctx) => {
    const { query, exchange } = ctx.data;
    const cacheKey = `proxy_search_${query}_${exchange}`;
    const cached = getCached<Json>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    params.set("query", query);
    params.set("exchanges", exchange);
    params.set("page_number", "1");
    params.set("records", "20");

    const url = `${UPSTOX_V2_URL}/instruments/search?${params.toString()}`;
    const response = await fetchWithRetry(url, { headers: getHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    const result = (data as { data?: Json }).data || [];
    setCache(cacheKey, result);
    return result;
  });

export const proxyGetMarketStatus = createServerFn({ method: "GET" }).handler(async () => {
  const url = `${UPSTOX_V2_URL}/market-status?exchange=NSE`;
  const response = await fetchWithRetry(url, { headers: getHeaders() });
  if (!response.ok) return null;
  const data = await response.json();
  const statuses = (data as { data?: Json[] }).data;
  return statuses?.[0] || null;
});

export const proxyGetWebSocketAuthUrl = createServerFn({ method: "GET" }).handler(async () => {
  const url = `${UPSTOX_V2_URL}/feed/market-data-feed/authorize`;
  const response = await fetchWithRetry(url, {
    headers: { ...getHeaders(), Accept: "application/json" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return (
    (data as { data?: { authorized_redirect_uri?: string } }).data?.authorized_redirect_uri || null
  );
});

// Generic proxy: client sends a URL, server fetches it with the token and returns raw JSON
export const proxyUpstoxFetch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { url: string; method: string })
  .handler(async (ctx) => {
    const { url, method } = ctx.data;
    const response = await fetchWithRetry(url, { method, headers: getHeaders() });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { status: "error", error: errData };
    }

    return response.json();
  });
