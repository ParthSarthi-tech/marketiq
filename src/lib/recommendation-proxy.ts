import { createServerFn } from "@tanstack/react-start";
import { STOCK_CONFIG, getAllTickers, getStockTags } from "./stockMetadata";

export interface RecommendationSignal {
  tag: string;
  title: string;
  note: string;
  confidence: number;
}

interface RecommendationInput {
  riskAppetite: string;
  goal: string;
  timeHorizon: string;
  knowledgeLevel: string;
  sectorPreferences: string[];
  holdings: Array<{
    ticker: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
  }>;
  cashBalance: number;
  totalPortfolioValue: number;
}

interface RecommendationResult {
  signals: RecommendationSignal[];
  error?: string;
  source: "local" | "ai";
}

const KNOWLEDGE_MAP: Record<string, string> = {
  beginner: "beginner (needs simple explanations)",
  intermediate: "intermediate (understands basic ratios)",
  advanced: "advanced (can evaluate financial statements)",
};

const RISK_MAP: Record<string, string> = {
  low: "conservative (prefers stable returns, low volatility)",
  "med-low": "moderate-conservative (balanced with slight safety bias)",
  "med-high": "moderate-aggressive (balanced with growth bias)",
  high: "aggressive (comfortable with high volatility for higher returns)",
};

type ProfileSignal = {
  tag: string;
  note: string;
  ticker: string;
};

const PROFILE_RECOMMENDATIONS: Record<string, ProfileSignal[]> = {
  low: [
    {
      tag: "Buy",
      note: "Stable dividend payer with strong brand moat and consistent FMCG demand.",
      ticker: "HINDUNILVR",
    },
    {
      tag: "Buy",
      note: "Market leader in FMCG with diversified revenue streams and steady cash flows.",
      ticker: "ITC",
    },
    {
      tag: "Hold",
      note: "Largest private sector bank with robust asset quality and NIM stability.",
      ticker: "HDFCBANK",
    },
  ],
  "med-low": [
    {
      tag: "Buy",
      note: "Diversified conglomerate with resilient FMCG, hotels and agri-business.",
      ticker: "ITC",
    },
    {
      tag: "Buy",
      note: "Telecom leader with ARPU expansion and 5G monetisation tailwinds.",
      ticker: "BHARTIARTL",
    },
    {
      tag: "Hold",
      note: "Private sector bank with strong liability franchise and steady growth.",
      ticker: "KOTAKBANK",
    },
  ],
  "med-high": [
    {
      tag: "Strong buy",
      note: "Energy-to-retail conglomerate with EBITDA growth and new energy upside.",
      ticker: "RELIANCE",
    },
    {
      tag: "Buy",
      note: "Global IT services leader benefiting from AI and cloud transformation.",
      ticker: "INFY",
    },
    {
      tag: "Watch",
      note: "Jewellery market leader with wedding season and festive demand catalysts.",
      ticker: "TITAN",
    },
  ],
  high: [
    {
      tag: "Strong buy",
      note: "NBFC leader with best-in-class asset quality and consistent ROE expansion.",
      ticker: "BAJFINANCE",
    },
    {
      tag: "Buy",
      note: "Premium jewellery brand with strong network effect and margin expansion.",
      ticker: "TITAN",
    },
    {
      tag: "Buy",
      note: "India's largest private port operator with rising cargo volumes and capex cycle.",
      ticker: "ADANIPORTS",
    },
  ],
};

function getLocalRecommendations(input: RecommendationInput): RecommendationSignal[] {
  const risk = input.riskAppetite || "med-high";
  const picks = PROFILE_RECOMMENDATIONS[risk] || PROFILE_RECOMMENDATIONS["med-high"];

  const alreadyOwned = new Set((input.holdings || []).map((h) => h.ticker.toUpperCase()));

  return picks.map((p, i) => {
    const config = STOCK_CONFIG[p.ticker];
    const name = config?.name || p.ticker;
    const owned = alreadyOwned.has(p.ticker);

    let action = p.tag;
    let note = p.note;

    if (owned) {
      const holding = input.holdings?.find((h) => h.ticker.toUpperCase() === p.ticker);
      action = "Hold";
      const plPct = holding
        ? (((holding.currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100).toFixed(1)
        : "0.0";
      note = `You hold ${holding?.quantity || 0} shares. Current P&L: ${+plPct >= 0 ? "+" : ""}${plPct}%. ${p.note}`;
    }

    return {
      tag: action,
      title: owned ? `Hold ${name}` : `Add ${name}`,
      note,
      confidence: Math.max(70, 92 - i * 6),
    };
  });
}

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as RecommendationInput)
  .handler(async (ctx): Promise<RecommendationResult> => {
    const {
      riskAppetite,
      goal,
      timeHorizon,
      knowledgeLevel,
      sectorPreferences,
      holdings,
      cashBalance,
      totalPortfolioValue,
    } = ctx.data;

    const localResult = getLocalRecommendations(ctx.data);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { signals: localResult, source: "local" };
    }

    const riskLabel = RISK_MAP[riskAppetite] || "moderate-aggressive";
    const knowledgeLabel = KNOWLEDGE_MAP[knowledgeLevel] || "intermediate";
    const sectorText = sectorPreferences?.length
      ? `Preferred sectors: ${sectorPreferences.join(", ")}.`
      : "";
    const holdingsText = holdings?.length
      ? holdings
          .map(
            (h) =>
              `${h.ticker} (${h.companyName}): ${h.quantity} shares @ avg ₹${h.avgBuyPrice}, current ₹${h.currentPrice}`,
          )
          .join("\n")
      : "No current holdings.";
    const cashText = `Available cash: ₹${cashBalance?.toLocaleString("en-IN") || "0"}`;
    const totalText = `Total portfolio value: ₹${totalPortfolioValue?.toLocaleString("en-IN") || "0"}`;

    const systemPrompt = `You are a SEBI-registered investment advisor for the Indian stock market (NSE/BSE).

USER PROFILE:
- Risk appetite: ${riskLabel}
- Investment goal: ${goal || "growth"}
- Time horizon: ${timeHorizon || "long-term"}
- Knowledge level: ${knowledgeLabel}
${sectorText}

CURRENT PORTFOLIO:
${holdingsText}
${cashText}
${totalText}

Based on this profile, generate exactly 3 personalized investment signals. Each signal must include:
- tag: one of "Strong buy", "Buy", "Hold", "Rebalance", "Watch", "Trim", or "Sell"
- title: a short actionable title (max 50 chars)
- note: a brief explanation (max 100 chars) with reasoning
- confidence: a number 0-100 indicating your conviction

Return ONLY valid JSON with this structure, no markdown wrapping, no explanation:
{"signals":[{"tag":"...","title":"...","note":"...","confidence":85}]}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const msg = errorBody?.error?.message || `API returned status ${response.status}`;
        console.warn("[RecommendationProxy] API error:", msg);
        return { signals: localResult, error: msg, source: "local" };
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return { signals: localResult, error: "Empty response from AI", source: "local" };
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      const parsed = JSON.parse(text);
      if (!parsed.signals || !Array.isArray(parsed.signals) || parsed.signals.length === 0) {
        return { signals: localResult, error: "Unexpected response format", source: "local" };
      }

      const validatedSignals: RecommendationSignal[] = parsed.signals.slice(0, 3).map((s: any) => ({
        tag: String(s.tag || "Watch"),
        title: String(s.title || "Review your portfolio"),
        note: String(s.note || ""),
        confidence: Math.min(100, Math.max(0, Number(s.confidence) || 50)),
      }));

      return { signals: validatedSignals, source: "ai" };
    } catch (err) {
      console.warn("[RecommendationProxy] Error:", err);
      return {
        signals: localResult,
        error: err instanceof Error ? err.message : "Unknown error",
        source: "local",
      };
    }
  });
