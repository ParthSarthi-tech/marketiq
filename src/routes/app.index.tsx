import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Target, Zap, BookOpen, ChevronRight, Activity } from "lucide-react";
import { PageHeader, StatCard, CountUp, Sparkline } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndianStocks, useNiftyQuote } from "@/hooks/useStocks";
import { isMarketOpen } from "@/hooks/useStocks";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — MarketIQ" },
      { name: "description", content: "Your daily snapshot: portfolio, AI signals and market movers." },
    ],
  }),
});

const signals = [
  { tag: "Strong buy", color: "var(--bull)", title: "Add LARSEN to portfolio", note: "Capex cycle + order book at all-time high.", conf: 92 },
  { tag: "Rebalance", color: "var(--gold)", title: "Trim tech allocation by 4%", note: "Overweight vs your risk profile after recent rally.", conf: 78 },
  { tag: "Watch", color: "var(--accent)", title: "SBI nearing breakout", note: "Approaching 52-week resistance with rising volume.", conf: 71 },
];

function Dashboard() {
  const { user } = useAuth();
  const { holdings, totalValue, totalPL, totalPLPercent, cashBalance } = usePortfolio(user?.id ?? null);
  const { data: profile } = useUserProfile(user?.id ?? null);
  const { data: marketStocks } = useIndianStocks();
  const { data: niftyQuote } = useNiftyQuote();

  const userName = user?.email?.split("@")[0] || "Investor";
  const riskLabel = profile?.risk_appetite === "high" ? "Aggressive" 
    : profile?.risk_appetite === "med-high" ? "Moderate-Aggressive"
    : profile?.risk_appetite === "med-low" ? "Moderate-Conservative"
    : profile?.risk_appetite === "low" ? "Conservative" 
    : "";

  const marketOpen = isMarketOpen();
  
  const topMovers = marketStocks?.slice(0, 5).map(s => ({
    sym: s.symbol,
    name: s.name,
    price: s.quote?.c || 0,
    chg: s.quote?.dp || 0,
    spark: Array.from({ length: 8 }, () => Math.random() * 20 + 10)
  })) || [];

  return (
    <div>
      <PageHeader
        eyebrow={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${userName}`}
        title={<>Markets are <span className="text-gradient">{marketOpen ? "awake" : "closed"}</span>.</>}
        subtitle={riskLabel ? `${riskLabel} investor · ₹${(totalValue + cashBalance).toLocaleString("en-IN")} total value` : "Complete onboarding to get personalized recommendations"}
        action={
          <Link to="/app/advisor" className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-glow hover:opacity-90 transition">
            <Sparkles className="w-4 h-4" /> Ask the AI
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Portfolio value" 
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(totalValue)} /></>} 
          delta={totalPLPercent >= 0 ? `+${totalPLPercent.toFixed(1)}%` : `${totalPLPercent.toFixed(1)}%`} 
          trend={totalPLPercent >= 0 ? "up" : "down"} 
          spark={[10, 12, 11, 14, 13, 16, 15, 18]} 
        />
        <StatCard 
          label="Today's P/L" 
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(totalPL)} /></>} 
          delta={totalPL >= 0 ? "+1.5%" : "-1.5%"} 
          trend={totalPL >= 0 ? "up" : "down"} 
          spark={[5, 7, 6, 9, 8, 11, 10, 12]} 
        />
        <StatCard 
          label="NIFTY 50" 
          value={<CountUp to={niftyQuote?.lastPrice || 24812.4} decimals={1} />} 
          delta={`${niftyQuote?.changePercent ? (niftyQuote.changePercent >= 0 ? "+" : "") + niftyQuote.changePercent.toFixed(2) : "-0.18"}%`} 
          trend={(niftyQuote?.changePercent || 0) >= 0 ? "up" : "down"} 
          spark={[24, 25, 26, 25, 24, 23, 24, 23]} 
        />
        <StatCard label="Cash" value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(cashBalance)} /></>} delta="available" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI signals */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">AI signals for you</div>
                <div className="text-xs text-muted-foreground">Personalised to your moderate-aggressive profile</div>
              </div>
            </div>
            <Link to="/app/advisor" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {signals.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-card/60 transition"
              >
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15" fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={94.2}
                      initial={{ strokeDashoffset: 94.2 }}
                      animate={{ strokeDashoffset: 94.2 - (94.2 * s.conf) / 100 }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold">{s.conf}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded" style={{ color: s.color, background: `color-mix(in oklab, ${s.color} 12%, transparent)` }}>{s.tag}</span>
                  </div>
                  <div className="font-medium mt-1">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.note}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Link to="/app/discover" className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-[var(--bull)]/15 flex items-center justify-center text-[var(--bull)] mb-3">
              <Target className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Discover stocks</div>
            <div className="text-xs text-muted-foreground">AI-matched picks across 12 sectors.</div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" /></div>
          </Link>
          <Link to="/app/portfolio" className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center text-[var(--gold)] mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Virtual portfolio</div>
            <div className="text-xs text-muted-foreground">7 holdings · ₹2.84L · +3.2% MoM</div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">Manage <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" /></div>
          </Link>
          <Link to="/app/learn" className="block rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1">Today's lesson</div>
            <div className="text-xs text-muted-foreground">Reading the P/E ratio without panic.</div>
            <div className="mt-4 text-xs text-primary inline-flex items-center gap-1">Start · 4 min <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" /></div>
          </Link>
        </div>
      </div>

      {/* Market movers */}
      <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Market movers
            </div>
            <div className="text-xs text-muted-foreground">Top moves across NSE</div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground inline-flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-[var(--bull)] animate-pulse-dot" : "bg-muted-foreground"}`} /> {marketOpen ? "Live" : "Closed"}
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
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${m.chg >= 0 ? "text-[var(--bull)] bg-[var(--bull)]/10" : "text-[var(--bear)] bg-[var(--bear)]/10"}`}>
                  {m.chg >= 0 ? "+" : ""}{m.chg.toFixed(2)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
