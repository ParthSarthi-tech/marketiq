import { createServerFn } from "@tanstack/react-start";

export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string | null;
  source: string;
  published_at: string;
  entities: { symbol: string; name: string; industry: string }[];
  sentiment: number;
}

interface MarketAuxResponse {
  meta: { found: number; returned: number; limit: number; page: number };
  data: NewsArticle[];
}

interface NewsPayload {
  symbols?: string;
  limit?: number;
  page?: number;
  filterEntities?: boolean;
}

export const fetchNews = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as NewsPayload)
  .handler(async (ctx: { data: NewsPayload }): Promise<{ articles: NewsArticle[]; total: number; error?: string }> => {
    try {
      const apiKey = process.env.MARKETAUX_API_KEY;
      if (!apiKey) {
        return { articles: [], total: 0, error: "MarketAux API key not configured." };
      }

      const { symbols, limit = 20, page = 1, filterEntities = true } = ctx.data;

      const params = new URLSearchParams({
        api_token: apiKey,
        limit: String(limit),
        page: String(page),
        countries: "in",
        language: "en",
        sort: "published_at",
        filter_entities: String(filterEntities),
      });

      if (symbols) params.set("symbols", symbols);

      const res = await fetch(`https://api.marketaux.com/v1/news/all?${params}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.meta?.error || `API returned status ${res.status}`;
        return { articles: [], total: 0, error: msg };
      }

      const json: MarketAuxResponse = await res.json();
      return { articles: json.data, total: json.meta.found };
    } catch (err) {
      console.error("[NewsAPI] Error:", err);
      return { articles: [], total: 0, error: "Failed to fetch news. Please try again." };
    }
  });

export function getSentimentLabel(sentiment: number): "positive" | "negative" | "neutral" {
  if (sentiment > 0.1) return "positive";
  if (sentiment < -0.1) return "negative";
  return "neutral";
}

export function getSentimentColor(sentiment: number): string {
  if (sentiment > 0.1) return "var(--bull)";
  if (sentiment < -0.1) return "var(--bear)";
  return "var(--gold)";
}

export function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function tickerToMarketAuxSymbol(ticker: string): string {
  return `${ticker}.BSE`;
}
