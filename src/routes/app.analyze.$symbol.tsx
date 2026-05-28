import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Target, Award, BarChart3, ArrowUpRight, ArrowDownRight, BookOpen, Loader2, AlertTriangle, Newspaper, ChevronDown, Info, Zap, X, RefreshCw, Plus, Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useStockQuote } from "@/hooks/useStocks";
import { loadStockDataAsync, loadStockData, getStockScore, getScoreBreakdown, getSignalLabel, type StockData } from "@/lib/stockData";
import { ScoreBreakdown as ScoreBreakdownPanel } from "@/components/app/score-breakdown";
import { fetchNews, tickerToMarketAuxSymbol, type NewsArticle } from "@/lib/news";
import { NewsCard, NewsCardSkeleton } from "@/components/app/news-card";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { isMarketOpenBool } from "@/lib/marketUtils";
import { addQueuedOrder } from "@/lib/orderQueue";
import { toast } from "sonner";

export const Route = createFileRoute("/app/analyze/$symbol")({
  component: StockAnalyze,
  head: () => ({ meta: [{ title: "Stock Analysis — MarketIQ" }, { name: "description", content: "Detailed stock analysis with AI insights" }] }),
});

function StockAnalyze() {
  const { symbol } = useParams({ from: "/app/analyze/$symbol" });
  const { data: quote } = useStockQuote(symbol);

  const { data: newsData, isLoading: newsLoading, isError: newsError, refetch: retryNews } = useQuery({
    queryKey: ["stockNews", symbol],
    queryFn: () =>
      fetchNews({
        data: {
          symbols: tickerToMarketAuxSymbol(symbol),
          limit: 5,
          filterEntities: true,
        },
      }),
    staleTime: 300_000,
    retry: 1,
  });

  const relatedArticles = newsData?.articles || [];

  const { data: stockData, isLoading: dataLoading } = useQuery({
    queryKey: ["stockData", symbol],
    queryFn: async () => {
      const syncData = loadStockData(symbol);
      if (syncData) return syncData;
      return loadStockDataAsync(symbol);
    },
    staleTime: 180_000,
    retry: 1,
  });

  const price = quote?.c || stockData?.currentPrice || 0;
  const change = quote?.dp || 0;
  const up = change >= 0;

  const breakdown = stockData ? getScoreBreakdown(stockData) : null;
  const score = breakdown?.total ?? 50;
  const signal = breakdown?.signal ?? "hold";
  const peContrib = breakdown?.factors.find(f => f.label === "P/E Ratio")?.contribution ?? 0;
  const opmContrib = breakdown?.factors.find(f => f.label === "Operating Margin")?.contribution ?? 0;
  const companyName = stockData?.companyName || symbol;

  const [openMetrics, setOpenMetrics] = useState<Set<string>>(new Set(['pe']));
  const [growthChartMode, setGrowthChartMode] = useState<'line' | 'bar'>('line');
  const [proMode, setProMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('proMode') === 'true');
  const [proDisclaimerDismissed, setProDisclaimerDismissed] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [buyQtyInput, setBuyQtyInput] = useState("1");
  const buyQty = Math.max(1, parseInt(buyQtyInput) || 1);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyQueued, setBuyQueued] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { buy, isBuying, cashBalance } = usePortfolio(user?.id ?? null);

  const marketOpen = isMarketOpenBool();

  const toggleProMode = () => {
    setProMode(v => {
      const next = !v;
      if (typeof window !== 'undefined') localStorage.setItem('proMode', String(next));
      return next;
    });
    setProDisclaimerDismissed(false);
  };

  const toggleMetric = (id: string) => {
    setOpenMetrics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const has52w = stockData ? stockData.week52High > 0 : false;

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        eyebrow={stockData?.sector || "NSE"}
        title={<>{symbol} <span className="text-gradient">{companyName}</span></>}
        subtitle={stockData ? `Market Cap: ${stockData.marketCap} | NSE: ${stockData.symbol}` : `NSE: ${symbol}`}
        action={
          <div className="flex items-center gap-2">
            {stockData && (
              <button
                onClick={toggleProMode}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  proMode ? 'bg-primary text-white' : 'glass text-muted-foreground hover:bg-card/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Pro
              </button>
            )}
            <Link to="/app/discover" className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm hover:bg-card/60 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Discover
            </Link>
          </div>
        }
      />

      {/* Pro Mode Disclaimer */}
      {stockData && proMode && !proDisclaimerDismissed && (
        <div className="mx-6 mb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground leading-relaxed flex-1">
              <strong className="text-foreground">Pro Mode</strong> — Extra metrics in table, compact education badges, expanded score breakdown, and additional OPM Trend chart.
            </span>
            <button onClick={() => setProDisclaimerDismissed(true)} className="shrink-0 text-muted-foreground hover:text-foreground transition p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Price Section */}
      <div className="relative overflow-hidden rounded-3xl mx-6 mb-8 bg-gradient-card border border-border/60">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative p-8 flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold mb-2">₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className={`flex items-center gap-2 text-lg ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
              {up ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {up ? "+" : ""}{change.toFixed(2)}% today
            </div>
            {has52w && stockData && <div className="text-sm text-muted-foreground mt-2">
              52W High: ₹{stockData.week52High.toLocaleString("en-IN")} | 52W Low: ₹{stockData.week52Low.toLocaleString("en-IN")}
            </div>}
          </div>
          
          {/* AI Score Circle */}
          {stockData && (
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(1 0 0 / 0.1)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={score >= 70 ? "var(--bull)" : score >= 45 ? "var(--gold)" : "var(--bear)"}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 283} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${(score / 100) * 283} 283` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">AI Score</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Signal Banner & Score Breakdown */}
        {stockData && breakdown && (
          <>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mx-8 mb-6 p-4 rounded-xl flex items-center gap-4 ${
                signal === "buy" ? "bg-[var(--bull)]/10 border border-[var(--bull)]/30" :
                signal === "hold" ? "bg-[var(--gold)]/10 border border-[var(--gold)]/30" :
                "bg-[var(--bear)]/10 border border-[var(--bear)]/30"
              }`}
            >
              <div className={`p-3 rounded-xl ${
                signal === "buy" ? "bg-[var(--bull)]/20" :
                signal === "hold" ? "bg-[var(--gold)]/20" :
                "bg-[var(--bear)]/20"
              }`}>
                {signal === "buy" ? <Target className="w-6 h-6 text-[var(--bull)]" /> :
                 signal === "hold" ? <Activity className="w-6 h-6 text-[var(--gold)]" /> :
                 <TrendingDown className="w-6 h-6 text-[var(--bear)]" />}
              </div>
              <div>
                <div className={`text-xl font-bold ${
                  signal === "buy" ? "text-[var(--bull)]" :
                  signal === "hold" ? "text-[var(--gold)]" :
                  "text-[var(--bear)]"
                }`}>
                  {signal === "buy" ? "BUY" : signal === "hold" ? "HOLD" : "SELL"}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {breakdown.summary}
                </div>
              </div>
            </motion.div>

            <div className="px-8 pb-6">
              <ScoreBreakdownPanel key={String(proMode)} breakdown={breakdown} defaultExpanded={proMode} />
            </div>
          </>
        )}
      </div>

      {/* Add to Portfolio */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add to Portfolio
          </h3>
          {!user ? (
            <p className="text-sm text-muted-foreground">Sign in to add stocks to your portfolio.</p>
          ) : buySuccess ? (
            <div className="flex items-center gap-2 text-sm text-[var(--bull)]">
              <Check className="w-4 h-4" />
              {buyQueued
                ? `Queued ${buyQty} share${buyQty > 1 ? "s" : ""} of ${symbol} — will execute next session`
                : `Added ${buyQty} share${buyQty > 1 ? "s" : ""} of ${symbol} to your portfolio.`}
              <button onClick={() => { setBuySuccess(false); setBuyQueued(false); }} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Buy more</button>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBuyQtyInput(v => String(Math.max(1, (parseInt(v) || 0) - 1)))}
                  className="w-8 h-8 rounded-lg bg-card/40 border border-border/40 flex items-center justify-center hover:bg-card/60 transition text-sm"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={buyQtyInput}
                  onChange={e => { const v = e.target.value; if (v === "" || /^\d+$/.test(v)) setBuyQtyInput(v); }}
                  className="w-16 text-center bg-card/40 border border-border/60 rounded-lg py-1.5 text-sm font-mono tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setBuyQtyInput(v => String(Math.max(1, (parseInt(v) || 0) + 1)))}
                  className="w-8 h-8 rounded-lg bg-card/40 border border-border/40 flex items-center justify-center hover:bg-card/60 transition text-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                × ₹{price.toLocaleString("en-IN")} ={" "}
                <span className="font-semibold text-foreground font-mono">
                  ₹{(buyQty * price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </span>
              {price > 0 && (
                <span className="text-xs text-muted-foreground w-full">
                  Remaining: ₹{Math.max(0, cashBalance - buyQty * price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
                  <span className={buyQty * price > cashBalance ? "text-[var(--bear)]" : "text-[var(--bull)]"}>
                    ({buyQty * price > cashBalance ? "exceeds" : "available"})
                  </span>
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowBuyConfirm(true)}
                disabled={isBuying || price <= 0 || buyQty * price > cashBalance}
                className="ml-auto inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold shadow-glow hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isBuying ? "Buying..." : `Buy ${buyQty}`}
              </button>
              {buyQty * price > cashBalance && (
                <span className="text-xs text-[var(--bear)] w-full">Insufficient funds (₹{cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })} available)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy Confirmation */}
      {showBuyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBuyConfirm(false)}>
          <div className="rounded-3xl p-6 bg-gradient-card border border-border/60 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Confirm Purchase</h3>
            <div className="text-sm text-muted-foreground space-y-2 mb-5">
              <p>Buying <strong className="text-foreground">{buyQty}</strong> share{buyQty > 1 ? "s" : ""} of <strong className="text-foreground">{symbol}</strong> at <strong className="text-foreground">₹{price.toLocaleString("en-IN")}</strong> each.</p>
              <p className="bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-xl px-4 py-3 text-[var(--gold)] text-xs leading-relaxed">
                <strong>Note:</strong> This is a virtual portfolio simulation. Orders placed outside market hours will be queued and executed at the next trading session.
              </p>
              <p className="text-xs">Total cost: <strong className="text-foreground font-mono">₹{(buyQty * price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBuyConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-card/40 border border-border/40 hover:bg-card/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowBuyConfirm(false);
                    try {
                      setBuySuccess(false);
                      setBuyQueued(false);
                      if (marketOpen) {
                        await buy(symbol, companyName, buyQty, price);
                      } else if (user?.id) {
                        await addQueuedOrder(user.id, symbol, companyName, "buy", buyQty, price);
                        setBuyQueued(true);
                      }
                      setBuySuccess(true);
                      toast(`${symbol} added to portfolio`, {
                      description: `${buyQty} share${buyQty > 1 ? "s" : ""} at ₹${price.toLocaleString("en-IN")}`,
                      action: { label: "View Portfolio", onClick: () => navigate({ to: "/app/portfolio" }) },
                    });
                  } catch (e: unknown) {
                    toast.error("Failed to add holding", {
                      description: e instanceof Error ? e.message : "Something went wrong.",
                    });
                  }
                }}
                disabled={isBuying}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold shadow-glow hover:opacity-90 disabled:opacity-40 transition"
              >
                {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isBuying ? "Buying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!stockData && !dataLoading && (
        <div className="mx-6 mb-8">
          <div className="rounded-3xl p-6 bg-gradient-card border border-border/60 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">Fundamental analysis unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {symbol} is not in our fundamental dataset yet. You can still view the live price and add it to your portfolio above.
            </p>
          </div>
        </div>
      )}

      {stockData && (
      <>
      {/* Fundamentals at a Glance */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl bg-gradient-card/50 border border-border/30 px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max text-sm">
            <FundStripItem label="Sales" value={formatCompact(stockData.currentSales)} />
            <Divider />
            <FundStripItem label="EPS" value={`₹${stockData.currentEPS.toFixed(1)}`} />
            <Divider />
            <FundStripItem label="P/E" value={`${stockData.currentPE.toFixed(1)}x`} />
            <Divider />
            <FundStripItem label="OPM" value={`${stockData.currentOPM.toFixed(1)}%`} />
            <Divider />
            <FundStripItem label="Div" value={`${stockData.currentDividendPayout.toFixed(0)}%`} />
            <Divider />
            <FundStripItem label="52WH" value={`₹${stockData.week52High.toLocaleString("en-IN")}`} />
            <Divider />
            <FundStripItem label="52WL" value={`₹${stockData.week52Low.toLocaleString("en-IN")}`} />
          </div>
        </div>
      </div>

      {/* Key Metrics Heatmap Table */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl bg-gradient-card border border-border/60 overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Key Metrics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border/40">
                  <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-6 py-2.5">Metric</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-4 py-2.5">Value</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-4 py-2.5">Assessment</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-4 py-2.5">Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <MetricRow
                  label="P/E Ratio"
                  value={stockData.currentPE > 0 ? `${stockData.currentPE.toFixed(1)}x` : "N/A"}
                  assessment={stockData.currentPE > 0 ? (stockData.currentPE < 20 ? "Undervalued" : stockData.currentPE < 30 ? "Fair" : "Premium") : "N/A"}
                  positive={stockData.currentPE > 0 && stockData.currentPE < 25}
                  range={stockData.currentPE > 0 ? (stockData.currentPE < 15 ? "Low" : stockData.currentPE < 25 ? "Moderate" : stockData.currentPE < 35 ? "High" : "Very High") : "N/A"}
                  rangePositive={stockData.currentPE > 0 && stockData.currentPE < 20}
                />
                <MetricRow
                  label="Operating Margin"
                  value={stockData.currentOPM > 0 ? `${stockData.currentOPM.toFixed(1)}%` : "N/A"}
                  assessment={stockData.currentOPM > 0 ? (stockData.currentOPM > 25 ? "Excellent" : "Good") : "N/A"}
                  positive={stockData.currentOPM > 0 && stockData.currentOPM > 20}
                  range={stockData.currentOPM > 0 ? (stockData.currentOPM > 40 ? "High" : stockData.currentOPM > 20 ? "Moderate" : "Low") : "N/A"}
                  rangePositive={stockData.currentOPM > 0 && stockData.currentOPM > 25}
                />
                <MetricRow
                  label="EPS"
                  value={stockData.currentEPS > 0 ? `₹${stockData.currentEPS.toFixed(1)}` : "N/A"}
                  assessment={stockData.currentEPS > 0 ? "TTM" : "N/A"}
                  positive={stockData.currentEPS > 0}
                  range={stockData.currentEPS > 10 ? "Strong" : stockData.currentEPS > 0 ? "Positive" : "N/A"}
                  rangePositive={stockData.currentEPS > 10}
                />
                <MetricRow
                  label="Dividend Payout"
                  value={stockData.currentDividendPayout > 0 ? `${stockData.currentDividendPayout.toFixed(0)}%` : "N/A"}
                  assessment={stockData.currentDividendPayout > 0 ? (stockData.currentDividendPayout > 50 ? "High Payout" : "Moderate") : "N/A"}
                  positive={stockData.currentDividendPayout > 40}
                  range={stockData.currentDividendPayout > 70 ? "Generous" : stockData.currentDividendPayout > 40 ? "Healthy" : stockData.currentDividendPayout > 0 ? "Low" : "N/A"}
                  rangePositive={stockData.currentDividendPayout > 40}
                />
                {proMode && stockData.week52High > 0 && (
                  <MetricRow label="52W High" value={`₹${stockData.week52High.toLocaleString("en-IN")}`} assessment="—" positive={true} range="—" rangePositive={true} />
                )}
                {proMode && stockData.week52Low > 0 && (
                  <MetricRow label="52W Low" value={`₹${stockData.week52Low.toLocaleString("en-IN")}`} assessment="—" positive={true} range="—" rangePositive={true} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Revenue & Profit Growth
            </h3>
            <div className="ml-auto flex gap-1 bg-card/50 rounded-lg p-0.5">
              <button onClick={() => setGrowthChartMode('line')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${growthChartMode === 'line' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>Line</button>
              <button onClick={() => setGrowthChartMode('bar')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${growthChartMode === 'bar' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>Bar</button>
            </div>
          </div>
          <div className="h-48 relative">
            <GrowthChart 
              revenueData={stockData.revenueGrowth} 
              profitData={stockData.profitGrowth}
              mode={growthChartMode}
            />
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenue Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--bull)]" />
              <span className="text-muted-foreground">Profit Growth</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            P/E Ratio Trend
          </h3>
          <div className="h-48 relative">
            <PEChart peData={stockData.peHistory} />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-card/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Trend: </span>
              <span className={`font-semibold ${
                stockData.trends.peTrend === "declining" ? "text-[var(--bull)]" :
                stockData.trends.peTrend === "increasing" ? "text-[var(--bear)]" :
                "text-[var(--gold)]"
              }`}>
                {stockData.trends.peTrend === "declining" ? "Declining - Good sign" :
                 stockData.trends.peTrend === "increasing" ? "Increasing - Watch out" :
                 "Stable"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OPM Trend Chart — Pro Mode only */}
      {proMode && (
        <div className="mx-6 mb-8">
          <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              OPM Trend
            </h3>
            <div className="h-40 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {stockData.opmHistory.map((v, i) => {
                  const max = Math.max(...stockData.opmHistory);
                  const h = (v / max) * 100;
                  const step = 100 / (stockData.opmHistory.length - 1);
                  const barW = step * 0.55;
                  const x = i * step + step * 0.225;
                  return (
                    <rect key={i} x={x} y={100 - h} width={barW} height={h} fill="var(--gold)" rx={2}>
                      <animate attributeName="height" from="0" to={h} dur="0.4s" begin={`${i * 0.08}s`} fill="freeze" />
                      <animate attributeName="y" from={100} to={100 - h} dur="0.4s" begin={`${i * 0.08}s`} fill="freeze" />
                    </rect>
                  );
                })}
              </svg>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Trailing {stockData.opmHistory.length} periods — Operating Margin trend
            </div>
          </div>
        </div>
      )}

      {/* AI Key Insights */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            AI Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard 
              title="Valuation"
              description={stockData.currentPE < 20 ? "Stock is undervalued with P/E below 20" : "Stock trading at premium valuations"}
              positive={stockData.currentPE < 25}
            />
            <InsightCard 
              title="Growth"
              description={`${stockData.trends.salesGrowth}% YoY revenue growth`}
              positive={stockData.trends.salesGrowth > 10}
            />
            <InsightCard 
              title="Dividends"
              description={`${stockData.currentDividendPayout.toFixed(0)}% payout - ${stockData.currentDividendPayout > 50 ? "Investor friendly" : "Growth focused"}`}
              positive={stockData.currentDividendPayout > 40}
            />
          </div>
        </div>
      </div>

      {/* Value Investing Analysis */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Value Investing Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ValueMetric 
              label="Graham Number"
              value={`₹${calculateGrahamNumber(stockData).toFixed(0)}`}
              tooltip="√(22.5 × EPS × Book Value per share) - Benjamin Graham's fair value"
            />
            <ValueMetric 
              label="Fair Value (DCF)"
              value={`₹${calculateFairValue(stockData).toFixed(0)}`}
              tooltip="Discounted Cash Flow model - Intrinsic value based on cash flows"
            />
            <ValueMetric 
              label="Margin of Safety"
              value={`${calculateMarginOfSafety(stockData, price).toFixed(1)}%`}
              tooltip="How much below intrinsic value the stock trades"
              highlight={calculateMarginOfSafety(stockData, price) > 20}
              negative={calculateMarginOfSafety(stockData, price) < 0}
            />
            <ValueMetric 
              label="PEG Ratio"
              value={calculatePEG(stockData).toFixed(2)}
              tooltip="P/E divided by growth rate - <1 indicates undervaluation"
              highlight={calculatePEG(stockData) < 1}
            />
          </div>
        </div>
      </div>

      {/* Statistical Analysis */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Statistical Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Revenue Stability"
              value={stockData.revenueGrowth.length > 1 ? `${calculateStability(stockData.revenueGrowth).toFixed(1)}%` : "N/A"}
              description="Coefficient of variation - lower is more stable"
              positive={stockData.revenueGrowth.length > 1 && calculateStability(stockData.revenueGrowth) < 30}
            />
            <StatCard 
              title="Profit Consistency"
              value={stockData.profitGrowth.length > 1 ? `${calculateStability(stockData.profitGrowth).toFixed(1)}%` : "N/A"}
              description="Variability in profit growth - consistency score"
              positive={stockData.profitGrowth.length > 1 && calculateStability(stockData.profitGrowth) < 40}
            />
            <StatCard 
              title="Margin Trend"
              value={stockData.trends.opmTrend || "N/A"}
              description={stockData.trends.opmTrend === "improving" ? "Operating margins expanding" : 
                         stockData.trends.opmTrend === "declining" ? "Margin pressure detected" : "Stable margins"}
              positive={stockData.trends.opmTrend === "improving" || stockData.trends.opmTrend === "stable"}
            />
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="mx-6 mb-8">
        <div className={`rounded-3xl p-6 ${proMode ? 'bg-card/20 border border-border/20' : 'bg-gradient-card/50 border border-border/40'}`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-5 h-5" />
            Understanding the Metrics
          </h3>
          {proMode ? (
            <div className="flex flex-wrap gap-2">
              {stockData.currentPE > 0 && (
                <ProMetricBadge
                  id="pe"
                  label="P/E"
                  value={`${stockData.currentPE.toFixed(1)}x`}
                  contrib={peContrib}
                  isActive={activeInfo === 'pe'}
                  onToggle={setActiveInfo}
                >
                  {stockData.symbol} at {stockData.currentPE.toFixed(1)}x — {stockData.currentPE < 20 ? "below average, potentially undervalued" : stockData.currentPE > 30 ? "above average, premium valuation" : "around average"}
                </ProMetricBadge>
              )}
              {stockData.currentOPM > 0 && (
                <ProMetricBadge
                  id="opm"
                  label="OPM"
                  value={`${stockData.currentOPM.toFixed(1)}%`}
                  contrib={opmContrib}
                  isActive={activeInfo === 'opm'}
                  onToggle={setActiveInfo}
                >
                  {stockData.currentOPM.toFixed(1)}% — {stockData.currentOPM > 30 ? "strong operational efficiency" : stockData.currentOPM > 20 ? "healthy margins" : "moderate"}
                </ProMetricBadge>
              )}
              {stockData.currentEPS > 0 && (
                <ProMetricBadge
                  id="graham"
                  label="Graham"
                  value={`₹${calculateGrahamNumber(stockData).toFixed(0)}`}
                  contrib={0}
                  isActive={activeInfo === 'graham'}
                  onToggle={setActiveInfo}
                >
                  Graham Number: ₹{calculateGrahamNumber(stockData).toFixed(0)} — {calculateGrahamNumber(stockData) > price ? "trades below, potential value" : "trades above"}
                </ProMetricBadge>
              )}
              {stockData.currentPE > 0 && (
                <ProMetricBadge
                  id="peg"
                  label="PEG"
                  value={calculatePEG(stockData).toFixed(2)}
                  contrib={0}
                  isActive={activeInfo === 'peg'}
                  onToggle={setActiveInfo}
                >
                  PEG {calculatePEG(stockData).toFixed(2)} — {calculatePEG(stockData) < 1 ? "undervalued" : calculatePEG(stockData) < 2 ? "fair" : "overvalued"}
                </ProMetricBadge>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {stockData.currentPE > 0 && (
                <EduAccordionItem
                  id="pe"
                  label="P/E Ratio"
                  isOpen={openMetrics.has('pe')}
                  onToggle={toggleMetric}
                >
                  Price-to-Earnings ratio measures how much investors pay per rupee of earnings. 
                  {stockData.symbol} at {stockData.currentPE.toFixed(1)}x means you pay ₹{stockData.currentPE.toFixed(1)} for every ₹1 of earnings. 
                  {stockData.currentPE < 20 ? "This is below average - potentially undervalued." : stockData.currentPE > 30 ? "This is above average - premium valuation." : "This is around average."}
                </EduAccordionItem>
              )}
              {stockData.currentOPM > 0 && (
                <EduAccordionItem
                  id="opm"
                  label="Operating Margin (OPM)"
                  isOpen={openMetrics.has('opm')}
                  onToggle={toggleMetric}
                >
                  OPM shows profitability from core operations. {stockData.symbol} at {stockData.currentOPM > 0 ? `${stockData.currentOPM.toFixed(1)}%` : "N/A"} is{" "}
                  {stockData.currentOPM > 30 ? "excellent - strong operational efficiency" : 
                   stockData.currentOPM > 20 ? "good - healthy margins" : 
                   stockData.currentOPM > 0 ? "moderate - room for improvement" : "not available from current data source"}
                  {stockData.currentOPM > 0 ? ` - meaning ₹${stockData.currentOPM.toFixed(1)} of every ₹100 in revenue becomes operating profit.` : "."}
                </EduAccordionItem>
              )}
              {stockData.currentEPS > 0 && (
                <EduAccordionItem
                  id="graham"
                  label="Graham Number"
                  isOpen={openMetrics.has('graham')}
                  onToggle={toggleMetric}
                >
                  Derived from Benjamin Graham's formula: √(22.5 × EPS × Book Value). 
                  Current Graham Number: ₹{calculateGrahamNumber(stockData).toFixed(0)}. 
                  {calculateGrahamNumber(stockData) > price ? "Stock trades below Graham Number - potential value." : "Stock trades above Graham Number."}
                </EduAccordionItem>
              )}
              {stockData.currentPE > 0 && (
                <EduAccordionItem
                  id="peg"
                  label="PEG Ratio"
                  isOpen={openMetrics.has('peg')}
                  onToggle={toggleMetric}
                >
                  P/E divided by growth rate adjusts P/E for growth. PEG &lt; 1 suggests undervaluation, 
                  &gt; 2 suggests overvaluation. {stockData.symbol} with {stockData.currentPE.toFixed(1)} P/E and ~{stockData.trends.salesGrowth.toFixed(0)}% growth = PEG {calculatePEG(stockData).toFixed(2)}
                </EduAccordionItem>
              )}
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Related News */}
      <div className="mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Related News
          </h3>
          {newsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : newsError ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Failed to load news.</p>
              <button
                type="button"
                onClick={() => retryNews()}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-card/40 border border-border/40 hover:bg-card/60 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          ) : relatedArticles.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No recent news for {symbol}.
            </div>
          ) : (
            <div className="space-y-3">
              {relatedArticles.map((article: NewsArticle, i: number) => (
                <NewsCard key={article.uuid} article={article} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, assessment, positive, range, rangePositive }: {
  label: string; value: string; assessment: string; positive: boolean; range: string; rangePositive: boolean;
}) {
  return (
    <tr className="hover:bg-card/30 transition">
      <td className="px-6 py-3 font-medium text-sm">{label}</td>
      <td className="px-4 py-3 text-right font-mono tabular-nums text-sm">{value}</td>
      <td className="px-4 py-3 text-right">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
            positive ? "text-[var(--bull)] bg-[var(--bull)]/10" : "text-[var(--bear)] bg-[var(--bear)]/10"
          }`}
        >
          {assessment}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className="text-[11px] font-mono px-2 py-0.5 rounded"
          style={{
            color: rangePositive ? "var(--bull)" : "var(--gold)",
            background: rangePositive
              ? "color-mix(in oklab, var(--bull) 10%, transparent)"
              : "color-mix(in oklab, var(--gold) 10%, transparent)",
          }}
        >
          {range}
        </span>
      </td>
    </tr>
  );
}

function GrowthChart({ revenueData, profitData, mode }: { revenueData: number[]; profitData: number[]; mode: 'line' | 'bar' }) {
  const max = Math.max(...revenueData, ...profitData);
  const height = 160;
  const width = 100;
  const step = width / (Math.max(revenueData.length - 1, 1));
  const yFor = (v: number) => height - (v / max) * height;

  if (mode === 'bar') {
    const barWidth = step * 0.35;
    const gap = step * 0.1;
    const groupPad = step * 0.1;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
          <line key={i} x1="0" x2={width} y1={i * height} y2={i * height} stroke="oklch(1 0 0 / 0.05)" />
        ))}
        {revenueData.map((v, i) => {
          const revBarH = (v / max) * height;
          const profBarH = (profitData[i] / max) * height;
          const revX = i * step + groupPad;
          const profX = i * step + groupPad + barWidth + gap;
          return (
            <g key={i}>
              <rect x={revX} y={height - revBarH} width={barWidth} height={revBarH} fill="var(--primary)" rx={2}>
                <animate attributeName="height" from="0" to={revBarH} dur="0.4s" begin={`${i * 0.06}s`} fill="freeze" />
                <animate attributeName="y" from={height} to={height - revBarH} dur="0.4s" begin={`${i * 0.06}s`} fill="freeze" />
              </rect>
              <rect x={profX} y={height - profBarH} width={barWidth} height={profBarH} fill="var(--bull)" rx={2}>
                <animate attributeName="height" from="0" to={profBarH} dur="0.4s" begin={`${(0.15 + i * 0.06).toFixed(3)}s`} fill="freeze" />
                <animate attributeName="y" from={height} to={height - profBarH} dur="0.4s" begin={`${(0.15 + i * 0.06).toFixed(3)}s`} fill="freeze" />
              </rect>
            </g>
          );
        })}
      </svg>
    );
  }

  const negY = Math.max(0, Math.min(height, yFor(0)));
  const modY = Math.max(0, Math.min(height, yFor(10)));

  const revPoints = revenueData.map((v, i) => `${i * step},${yFor(v)}`).join(" ");
  const profPoints = profitData.map((v, i) => `${i * step},${yFor(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Growth zone bands */}
      <rect x="0" y={0} width={width} height={modY} fill="oklch(0.6 0.2 145 / 0.12)" />
      <rect x="0" y={modY} width={width} height={negY - modY} fill="oklch(0.75 0.15 85 / 0.12)" />
      <rect x="0" y={negY} width={width} height={height - negY} fill="oklch(0.65 0.2 15 / 0.12)" />
      {modY > 8 && <text x="2" y={modY - 4} fill="oklch(0.6 0.2 145 / 0.5)" fontSize="7" fontWeight="600">Strong</text>}
      {negY - modY > 8 && <text x="2" y={modY + 12} fill="oklch(0.75 0.15 85 / 0.5)" fontSize="7" fontWeight="600">Moderate</text>}
      {height - negY > 8 && <text x="2" y={negY + 12} fill="oklch(0.65 0.2 15 / 0.5)" fontSize="7" fontWeight="600">Negative</text>}
      {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
        <line key={i} x1="0" x2={width} y1={i * height} y2={i * height} stroke="oklch(1 0 0 / 0.05)" />
      ))}
      <defs>
        <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="profGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--bull)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--bull)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${revPoints} ${width},${height}`} fill="url(#revGrad)" />
      <polygon points={`0,${height} ${profPoints} ${width},${height}`} fill="url(#profGrad)" />
      <motion.polyline 
        points={revPoints} 
        fill="none" 
        stroke="var(--primary)" 
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.polyline 
        points={profPoints} 
        fill="none" 
        stroke="var(--bull)" 
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
    </svg>
  );
}

function PEChart({ peData }: { peData: number[] }) {
  const max = Math.max(...peData) * 1.2;
  const min = Math.min(...peData) * 0.8;
  const range = max - min;
  const height = 160;
  const width = 100;
  const step = width / (peData.length - 1);

  const yFor = (v: number) => Math.max(0, Math.min(height, height - ((v - min) / range) * height));

  const greenTop = yFor(15);
  const yellowTop = yFor(25);

  const points = peData.map((v, i) => `${i * step},${yFor(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Valuation bands */}
      <rect x="0" y={greenTop} width={width} height={height - greenTop} fill="oklch(0.6 0.2 145 / 0.15)" rx="4" />
      <rect x="0" y={yellowTop} width={width} height={greenTop - yellowTop} fill="oklch(0.75 0.15 85 / 0.15)" rx="4" />
      <rect x="0" y={0} width={width} height={yellowTop} fill="oklch(0.65 0.2 15 / 0.15)" rx="4" />
      {/* Zone labels */}
      <text x="2" y={greenTop + 12} fill="oklch(0.6 0.2 145 / 0.5)" fontSize="7" fontWeight="600">Undervalued</text>
      <text x="2" y={Math.max(yellowTop + 12, 8)} fill="oklch(0.75 0.15 85 / 0.5)" fontSize="7" fontWeight="600">Fair</text>
      <text x="2" y="10" fill="oklch(0.65 0.2 15 / 0.5)" fontSize="7" fontWeight="600">Premium</text>
      {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
        <line key={i} x1="0" x2={width} y1={i * height} y2={i * height} stroke="oklch(1 0 0 / 0.05)" />
      ))}
      <motion.polyline 
        points={points} 
        fill="none" 
        stroke="var(--gold)" 
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      {peData.map((v, i) => (
        <motion.circle 
          key={i}
          cx={i * step} 
          cy={yFor(v)} 
          r="2" 
          fill="var(--gold)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}

function InsightCard({ title, description, positive }: { title: string; description: string; positive: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${positive ? "bg-[var(--bull)]/5 border-[var(--bull)]/20" : "bg-[var(--bear)]/5 border-[var(--bear)]/20"}`}>
      <div className={`text-sm font-semibold mb-1 ${positive ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

function ValueMetric({ label, value, tooltip, highlight, negative }: { label: string; value: string; tooltip: string; highlight?: boolean; negative?: boolean }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${highlight ? "bg-[var(--bull)]/10 border-[var(--bull)]/30" : negative ? "bg-[var(--bear)]/10 border-[var(--bear)]/30" : "bg-card/50 border-border/40"}`}
      title={tooltip}
    >
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? "text-[var(--bull)]" : negative ? "text-[var(--bear)]" : ""}`}>{value}</div>
    </motion.div>
  );
}

function StatCard({ title, value, description, positive }: { title: string; value: string; description: string; positive: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${positive ? "bg-[var(--bull)]/5 border-[var(--bull)]/20" : "bg-[var(--gold)]/5 border-[var(--gold)]/20"}`}>
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className={`text-lg font-bold ${positive ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}

function calculateGrahamNumber(data: StockData): number {
  const bookValuePerShare = data.currentEPS * 8;
  return Math.sqrt(22.5 * data.currentEPS * bookValuePerShare);
}

function calculateFairValue(data: StockData): number {
  const avgGrowth = data.trends.salesGrowth / 100;
  const baseValue = data.currentEPS * (1 + avgGrowth);
  const discountRate = 0.12;
  const years = 5;
  let dcfValue = 0;
  for (let i = 1; i <= years; i++) {
    dcfValue += (baseValue * Math.pow(1 + avgGrowth * 0.8, i)) / Math.pow(1 + discountRate, i);
  }
  const terminalValue = (baseValue * Math.pow(1 + avgGrowth * 0.8, years) * 1.5) / (discountRate - 0.03);
  dcfValue += terminalValue / Math.pow(1 + discountRate, years);
  return dcfValue;
}

function calculateMarginOfSafety(data: StockData, priceOverride?: number): number {
  const fairValue = calculateFairValue(data);
  const currentPrice = priceOverride || data.currentPrice || 0;
  if (currentPrice <= 0) return 0;
  const margin = ((fairValue - currentPrice) / fairValue) * 100;
  return Math.round(margin * 10) / 10;
}

function calculatePEG(data: StockData): number {
  const growth = data.trends.salesGrowth;
  if (growth <= 0) return 10;
  return data.currentPE / growth;
}

function calculateStability(data: number[]): number {
  if (!data || data.length === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / Math.abs(mean)) * 100;
}

function formatCompact(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toFixed(0)}`;
}

function Divider() {
  return <div className="w-px h-6 bg-border/40 shrink-0" />;
}

function FundStripItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</span>
      <span className="font-semibold font-mono text-[13px] tabular-nums">{value}</span>
    </div>
  );
}

function ProMetricBadge({ id, label, value, contrib, isActive, onToggle, children }: {
  id: string; label: string; value: string; contrib: number; isActive: boolean; onToggle: (id: string | null) => void; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(isActive ? null : id)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card/40 text-xs hover:bg-card/60 transition border border-border/20"
      >
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{value}</span>
        {contrib !== 0 && (
          <span className={`font-mono text-[11px] font-bold ${contrib > 0 ? 'text-[var(--bull)]' : 'text-[var(--bear)]'}`}>
            {contrib > 0 ? '+' : ''}{contrib}
          </span>
        )}
      </button>
      {isActive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-2.5 rounded-xl bg-card border border-border/60 shadow-lg text-xs text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function EduAccordionItem({ id, label, isOpen, onToggle, children }: {
  id: string; label: string; isOpen: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card/30 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-card/50 transition"
      >
        <span className="font-medium text-primary text-sm">{label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-muted-foreground text-xs leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}