import { createServerFn } from "@tanstack/react-start";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 180_000;

function getCached<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T;
  }
  responseCache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

interface FinnhubProfile {
  name: string;
  sector: string | null;
  industry: string | null;
  marketCap: number | null;
  shareOutstanding: number | null;
  country: string | null;
  logo: string | null;
}

interface FinnhubMetric {
  peTTM: number | null;
  epsTTM: number | null;
  dividendYield: number | null;
  dividendPerShare: number | null;
  revenueTTM: number | null;
  revenueGrowth: number | null;
  netProfitMargin: number | null;
  operatingMargin: number | null;
  roeTTM: number | null;
  roaTTM: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  pbRatio: number | null;
  high52: number | null;
  low52: number | null;
  priceAvg50: number | null;
  priceAvg200: number | null;
}

export interface FinnhubResult {
  profile: FinnhubProfile | null;
  metric: FinnhubMetric | null;
  error?: string;
}

function toFinnhubSymbol(ticker: string): string {
  const t = ticker.toUpperCase();
  if (t.endsWith(".NS") || t.endsWith(".BO")) return t;
  return `${t}.NS`;
}

export const fetchFinnhubData = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as { ticker: string })
  .handler(async (ctx): Promise<FinnhubResult> => {
    const { ticker } = ctx.data;
    const symbol = toFinnhubSymbol(ticker);
    const cacheKey = `finnhub:${symbol}`;

    const cached = getCached<FinnhubResult>(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return { profile: null, metric: null, error: "Finnhub API key not configured" };
    }

    let profile: FinnhubProfile | null = null;
    let metric: FinnhubMetric | null = null;

    try {
      const profileRes = await fetch(
        `${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${apiKey}`
      );
      if (profileRes.ok) {
        const p = await profileRes.json();
        if (p && p.name) {
          profile = {
            name: p.name,
            sector: p.finnhubIndustry || null,
            industry: null,
            marketCap: p.marketCapitalization || null,
            shareOutstanding: p.shareOutstanding || null,
            country: p.country || null,
            logo: p.logo || null,
          };
        }
      }
    } catch {
      // profile fetch failed, continue
    }

    try {
      const metricRes = await fetch(
        `${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`
      );
      if (metricRes.ok) {
        const m = await metricRes.json();
        const series = m?.metric || {};
        metric = {
          peTTM: series.peBasicExclExtraTTM ?? series.peTTM ?? null,
          epsTTM: series.epsTTM ?? null,
          dividendYield: series.dividendYieldIndicatedAnnual ?? null,
          dividendPerShare: series.dividendPerShareAnnual ?? null,
          revenueTTM: series.revenueTTM ?? null,
          revenueGrowth: series.revenueGrowth ?? null,
          netProfitMargin: series.netProfitMargin ?? null,
          operatingMargin: series.operatingMargin ?? null,
          roeTTM: series.roeTTM ?? null,
          roaTTM: series.roaTTM ?? null,
          currentRatio: series.currentRatio ?? null,
          debtToEquity: series.debtToEquity ?? null,
          pbRatio: series.pbAnnual ?? null,
          high52: series["52WeekHigh"] ?? null,
          low52: series["52WeekLow"] ?? null,
          priceAvg50: series["priceAvg50"] ?? null,
          priceAvg200: series["priceAvg200"] ?? null,
        };
      }
    } catch {
      // metric fetch failed, continue
    }

    const result: FinnhubResult = { profile, metric };
    setCache(cacheKey, result);
    return result;
  });
