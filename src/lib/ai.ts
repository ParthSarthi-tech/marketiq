import type { QuizResponse, Portfolio } from "./supabase";
import { getFundamentals, getFundamentalsForTickers } from "./fundamentals";
import type { Fundamentals } from "./fundamentals";

export interface AIContext {
  userProfile: QuizResponse | null;
  portfolio: Portfolio[];
  portfolioValue: number;
  cashBalance: number;
}

function formatFundamentals(ticker: string, f: Fundamentals): string {
  const fmtCr = (v: number) => v >= 10000 ? `₹${(v / 100).toFixed(1)}L Cr` : `₹${v.toLocaleString("en-IN")} Cr`;
  const parts = [`Sales ${fmtCr(f.sales)}`];
  if (f.netProfit > 0) parts.push(`NP ${fmtCr(f.netProfit)}`);
  if (f.eps > 0) parts.push(`EPS ₹${f.eps.toFixed(2)}`);
  if (f.pe > 0) parts.push(`P/E ${f.pe.toFixed(1)}`);
  if (f.opm > 0) parts.push(`OPM ${f.opm.toFixed(1)}%`);
  if (f.salesGrowth3Y != null) parts.push(`3Y Gr. ${f.salesGrowth3Y.toFixed(1)}%`);
  if (f.dividendPayout != null) parts.push(`Div. ${f.dividendPayout.toFixed(1)}%`);
  return `${ticker}: ${parts.join(" | ")}`;
}

export function buildSystemPrompt(context: AIContext): string {
  const profile = context.userProfile;
  const riskProfile = profile
    ? `${profile.risk_appetite} risk tolerance, ${profile.time_horizon} time horizon, goal: ${profile.goal}`
    : "new investor";

  const holdings = context.portfolio
    .map((h) => `${h.ticker} (${h.quantity} shares, avg ₹${h.avg_buy_price})`)
    .join(", ") || "No holdings yet";

  const tickers = [...new Set(context.portfolio.map((h) => h.ticker))];
  const fundaLines = tickers
    .map((t) => {
      const f = getFundamentals(t);
      return f ? formatFundamentals(t, f) : null;
    })
    .filter(Boolean)
    .join("\n");

  const fundaSection = fundaLines
    ? `\nFUNDAMENTALS (Trailing):\n${fundaLines}`
    : "";

  return `You are MarketIQ, a smart AI investing advisor for Indian stock markets (NSE/BSE).

USER PROFILE:
- Risk Profile: ${riskProfile}
- Current Holdings: ${holdings || "Empty"}
- Portfolio Value: ₹${context.portfolioValue.toLocaleString("en-IN")}
- Cash Available: ₹${context.cashBalance.toLocaleString("en-IN")}${fundaSection}

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
11. Use FUNDAMENTALS data above when analyzing holdings or suggesting trades
12. Cross-reference fundamentals with user's risk profile for personalized advice

Remember: This is a virtual portfolio for learning. Don't encourage real trading.`;
}