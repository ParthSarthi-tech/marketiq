import type { QuizResponse, Portfolio } from "./supabase";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

interface Message {
  role: "user" | "model";
  content: string;
}

export interface AIContext {
  userProfile: QuizResponse | null;
  portfolio: Portfolio[];
  portfolioValue: number;
  cashBalance: number;
}

export function buildSystemPrompt(context: AIContext): string {
  const profile = context.userProfile;
  const riskProfile = profile
    ? `${profile.risk_appetite} risk tolerance, ${profile.time_horizon} time horizon, goal: ${profile.goal}`
    : "new investor";

  const holdings = context.portfolio
    .map((h) => `${h.ticker} (${h.quantity} shares, avg ₹${h.avg_buy_price})`)
    .join(", ") || "No holdings yet";

  return `You are MarketIQ, a smart AI investing advisor for Indian stock markets (NSE/BSE).

USER PROFILE:
- Risk Profile: ${riskProfile}
- Current Holdings: ${holdings || "Empty"}
- Portfolio Value: ₹${context.portfolioValue.toLocaleString("en-IN")}
- Cash Available: ₹${context.cashBalance.toLocaleString("en-IN")}

GUIDELINES:
1. Give practical, beginner-friendly advice
2. When suggesting stocks, consider Indian NSE stocks
3. Include approximate price targets (1-year horizon)
4. Explain in simple terms, avoid jargon
5. Consider user's risk profile in recommendations
6. If mentioning stocks, suggest realistic NSE symbols (e.g., RELIANCE, TCS, INFY, HDFCBANK, LT, TITAN)
7. Always be honest about risks and uncertainties
8. Suggest portfolio rebalancing only if significantly overweight/underweight
9. Keep responses conversational but informative
10. If you don't know something, say so honestly

Remember: This is a virtual portfolio for learning. Don't encourage real trading.`;
}

export async function sendChatMessage(
  userMessage: string,
  context: AIContext,
  history: Message[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI request failed");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("AI Error:", error);
    return "I apologize, I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

export function parseStockQuery(query: string): string | null {
  const stockPatterns = [
    /(?:is|should I buy|buy|stock|share|stock symbol)\s+([A-Z]{2,10})/i,
    /(?:分析|建议|看看)\s*([A-Z]{2,10})/i,
    /^(RELIANCE|TCS|INFY|HDFCBANK|LT|TITAN|SBIN|BAJFINANCE|ITC|SUNPHARMA|BHARTIARTL|AXISBANK|KOTAKBANK|MARUTI|ADANIPORTS)$/i,
  ];

  for (const pattern of stockPatterns) {
    const match = query.match(pattern);
    if (match) {
      const symbol = match[1].toUpperCase();
      if (["RELIANCE", "TCS", "INFY", "HDFCBANK", "LT", "TITAN", "SBIN", "BAJFINANCE", "ITC", "SUNPHARMA", "BHARTIARTL", "AXISBANK", "KOTAKBANK", "MARUTI", "ADANIPORTS"].includes(symbol)) {
        return symbol;
      }
    }
  }
  return null;
}