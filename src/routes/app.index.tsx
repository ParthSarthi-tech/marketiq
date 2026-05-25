import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  ChevronRight,
  Activity,
  Loader2,
  BarChart3,
  Plus,
} from "lucide-react";
import { PageHeader, StatCard, CountUp, Sparkline } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndianStocks, useNiftyQuote } from "@/hooks/useStocks";
import { isMarketOpen } from "@/hooks/useStocks";
import { getRecommendations, type RecommendationSignal } from "@/lib/recommendation-proxy";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — MarketIQ" },
      {
        name: "description",
        content: "Your daily snapshot: portfolio, AI signals and market movers.",
      },
    ],
  }),
});

function getSignalColor(tag: string): string {
  switch (tag.toLowerCase()) {
    case "strong buy":
    case "buy":
      return "var(--bull)";
    case "rebalance":
    case "hold":
      return "var(--gold)";
    case "watch":
    case "trim":
      return "var(--accent)";
    case "sell":
      return "var(--bear)";
    default:
      return "var(--primary)";
  }
}

function Dashboard() {
  const { user } = useAuth();
  const { holdings, totalValue, totalPL, totalPLPercent, cashBalance } = usePortfolio(
    user?.id ?? null,
  );
  const { data: profile } = useUserProfile(user?.id ?? null);
  const { data: marketStocks } = useIndianStocks();
  const { data: niftyQuote } = useNiftyQuote();

  const userName = user?.email?.split("@")[0] || "Investor";
  const riskLabel =
    profile?.risk_appetite === "high"
      ? "Aggressive"
      : profile?.risk_appetite === "med-high"
        ? "Moderate-Aggressive"
        : profile?.risk_appetite === "med-low"
          ? "Moderate-Conservative"
          : profile?.risk_appetite === "low"
            ? "Conservative"
            : "";

  const marketOpen = isMarketOpen();

  const { data: aiSignals, isLoading: signalsLoading } = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: () =>
      getRecommendations({
        data: {
          riskAppetite: profile?.risk_appetite || "med-high",
          goal: profile?.goal || "growth",
          timeHorizon: profile?.time_horizon || "long-term",
          knowledgeLevel: profile?.knowledge_level || "intermediate",
          sectorPreferences: profile?.sector_preference || [],
          holdings: holdings.map((h) => ({
            ticker: h.ticker,
            companyName: h.company_name,
            quantity: h.quantity,
            avgBuyPrice: h.avg_buy_price,
            currentPrice: h.currentPrice,
          })),
          cashBalance,
          totalPortfolioValue: totalValue,
        },
      }),
    enabled: !!user?.id,
    staleTime: 300_000,
    retry: 1,
  });

  const signals: Array<RecommendationSignal & { color: string; conf: number }> = (
    aiSignals?.signals || []
  ).map((s) => ({
    ...s,
    color: getSignalColor(s.tag),
    conf: s.confidence,
  }));

  const hasSignals = signals.length > 0;

  const hasHoldings = holdings.length > 0;

  const topMovers =
    marketStocks?.slice(0, 5).map((s) => ({
      sym: s.symbol,
      name: s.name,
      price: s.quote?.c || 0,
      chg: s.quote?.dp || 0,
      spark: Array.from({ length: 8 }, () => Math.random() * 20 + 10),
    })) || [];

  return (
    <div className="relative">
      <PageHeader
        eyebrow={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${userName}`}
        title={
          <>
            Markets are <span className="text-gradient">{marketOpen ? "awake" : "closed"}</span>.
          </>
        }
        subtitle={
          riskLabel
            ? `${riskLabel} investor · ₹${(totalValue + cashBalance).toLocaleString("en-IN")} total value`
            : "Complete onboarding to get personalized recommendations"
        }
        action={
          <Link
            to="/app/advisor"
            className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-glow hover:opacity-90 transition"
          >
            <Sparkles className="w-4 h-4" /> Ask the AI
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {hasHoldings ? (
          <StatCard
            label="Portfolio value"
            value={
              <>
                <span className="text-muted-foreground text-xl">₹</span>
                <CountUp to={Math.round(totalValue)} />
              </>
            }
            delta={
              totalPLPercent >= 0
                ? `+${totalPLPercent.toFixed(1)}%`
                : `${totalPLPercent.toFixed(1)}%`
            }
            trend={totalPLPercent >= 0 ? "up" : "down"}
            spark={[10, 12, 11, 14, 13, 16, 15, 18]}
          />
        ) : (
          <Link to="/app/discover" className="col-span-2 md:col-span-1 group">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl p-5 bg-gradient-card border border-border/60 overflow-hidden group-hover:border-primary/40 transition h-full"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                Portfolio value
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bull)]/15 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[var(--bull)]" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold">Add some stocks</div>
                    <div className="text-xs text-muted-foreground">See your portfolio here</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        )}
        {hasHoldings ? (
          <StatCard
            label="Today's P/L"
            value={
              <>
                <span className="text-muted-foreground text-xl">₹</span>
                <CountUp to={Math.round(totalPL)} />
              </>
            }
            delta={totalPL >= 0 ? "+1.5%" : "-1.5%"}
            trend={totalPL >= 0 ? "up" : "down"}
            spark={[5, 7, 6, 9, 8, 11, 10, 12]}
          />
        ) : (
          <Link to="/app/portfolio" className="col-span-2 md:col-span-1 group">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-2xl p-5 bg-gradient-card border border-border/60 overflow-hidden group-hover:border-primary/40 transition h-full"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                Today's P&L
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold">Track your gains</div>
                    <div className="text-xs text-muted-foreground">Start investing to see P&L</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        )}
        <StatCard
          label="NIFTY 50"
          value={<CountUp to={niftyQuote?.lastPrice || 24812.4} decimals={1} />}
          delta={`${niftyQuote?.changePercent ? (niftyQuote.changePercent >= 0 ? "+" : "") + niftyQuote.changePercent.toFixed(2) : "-0.18"}%`}
          trend={(niftyQuote?.changePercent || 0) >= 0 ? "up" : "down"}
          spark={[24, 25, 26, 25, 24, 23, 24, 23]}
        />
        <StatCard
          label="Cash"
          value={
            <>
              <span className="text-muted-foreground text-xl">₹</span>
              <CountUp to={Math.round(cashBalance)} />
            </>
          }
          delta="available"
          trend="up"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI signals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-2 rounded-3xl p-6 bg-gradient-card border border-border/40 border-rotate overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">AI signals for you</div>
                <div className="text-xs text-muted-foreground">
                  {riskLabel
                    ? `Personalised to your ${riskLabel.toLowerCase()} profile`
                    : "Personalised recommendations"}
                </div>
              </div>
            </div>
            <Link
              to="/app/advisor"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {signalsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 animate-pulse"
                  >
                    <div className="w-14 h-14 rounded-full bg-border/60 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-border/60 rounded" />
                      <div className="h-4 w-40 bg-border/60 rounded" />
                      <div className="h-3 w-56 bg-border/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSignals ? (
              signals.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-card/60 transition"
                >
                  <div className="relative w-14 h-14 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="oklch(1 0 0 / 0.06)"
                        strokeWidth="3"
                      />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={94.2}
                        initial={{ strokeDashoffset: 94.2 }}
                        animate={{ strokeDashoffset: 94.2 - (94.2 * s.conf) / 100 }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold">
                      {s.conf}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded"
                        style={{
                          color: s.color,
                          background: `color-mix(in oklab, ${s.color} 12%, transparent)`,
                        }}
                      >
                        {s.tag}
                      </span>
                    </div>
                    <div className="font-medium mt-1">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.note}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Complete onboarding to get personalized signals.
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-4"
        >
          <Link
            to="/app/discover"
            className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--bull)]/15 flex items-center justify-center text-[var(--bull)] mb-3">
              <Target className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Discover stocks</div>
            <div className="text-xs text-muted-foreground">AI-matched picks across 12 sectors.</div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">
              Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
          <Link
            to="/app/portfolio"
            className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center text-[var(--gold)] mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Virtual portfolio</div>
            <div className="text-xs text-muted-foreground">
              {hasHoldings
                ? `${holdings.length} holdings · ₹${totalValue.toLocaleString("en-IN")} · ${totalPLPercent >= 0 ? "+" : ""}${totalPLPercent.toFixed(1)}%`
                : "Start building your portfolio"}
            </div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">
              {hasHoldings ? "Manage" : "Get started"}{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
          <Link
            to="/app/learn"
            className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Today's lesson</div>
            <div className="text-xs text-muted-foreground">
              Reading the P/E ratio without panic.
            </div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">
              Start · 4 min{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Market movers */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="rounded-3xl p-6 bg-gradient-card border border-border/60"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Market movers
            </div>
            <div className="text-xs text-muted-foreground">Top moves across NSE</div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground inline-flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-[var(--bull)] animate-pulse-dot" : "bg-muted-foreground"}`}
            />{" "}
            {marketOpen ? "Live" : "Closed"}
          </span>
        </div>
        <div className="divide-y divide-border/40">
          {topMovers.map((m, i) => (
            <motion.div
              key={m.sym}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="grid grid-cols-12 items-center gap-3 py-3"
            >
              <div className="col-span-5 sm:col-span-4">
                <div className="font-mono text-xs text-muted-foreground">{m.sym}</div>
                <div className="text-sm font-medium truncate">{m.name}</div>
              </div>
              <div className="col-span-3 hidden sm:block">
                <Sparkline values={m.spark} positive={m.chg >= 0} />
              </div>
              <div className="col-span-4 sm:col-span-3 text-right font-mono tabular-nums text-sm">
                ₹{m.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-3 sm:col-span-2 text-right">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${m.chg >= 0 ? "text-[var(--bull)] bg-[var(--bull)]/10" : "text-[var(--bear)] bg-[var(--bear)]/10"}`}
                >
                  {m.chg >= 0 ? "+" : ""}
                  {m.chg.toFixed(2)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
