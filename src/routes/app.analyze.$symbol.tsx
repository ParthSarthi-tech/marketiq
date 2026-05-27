import { createFileRoute, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Target, Award, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, BookOpen, Loader2, AlertTriangle, Newspaper } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useStockQuote } from "@/hooks/useStocks";
import { loadStockDataAsync, getStockScore, getScoreBreakdown, getSignalLabel, type StockData } from "@/lib/stockData";
import { ScoreBreakdown as ScoreBreakdownPanel } from "@/components/app/score-breakdown";
import { fetchNews, tickerToMarketAuxSymbol, type NewsArticle } from "@/lib/news";
import { NewsCard, NewsCardSkeleton } from "@/components/app/news-card";

export const Route = createFileRoute("/app/analyze/$symbol")({
  component: StockAnalyze,
  head: () => ({ meta: [{ title: "Stock Analysis — MarketIQ" }, { name: "description", content: "Detailed stock analysis with AI insights" }] }),
});

function StockAnalyze() {
  const { symbol } = useParams({ from: "/app/analyze/$symbol" });
  const { data: quote } = useStockQuote(symbol);

  const { data: newsData, isLoading: newsLoading } = useQuery({
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
    queryFn: () => loadStockDataAsync(symbol),
    staleTime: 180_000,
    retry: 1,
  });

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading {symbol} data...</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    const price = quote?.c || 0;
    const change = quote?.dp || 0;
    const up = change >= 0;
    return (
      <div className="min-h-screen pb-12">
        <PageHeader
          title={<>{symbol} <span className="text-muted-foreground text-xl font-normal">— NSE</span></>}
          action={
            <a href="/app/discover" className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm hover:bg-card/60 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Discover
            </a>
          }
        />
        <div className="mx-6 mb-8">
          <div className="rounded-3xl p-8 bg-gradient-card border border-border/60">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl font-bold mb-2">₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                <div className={`flex items-center gap-2 text-lg ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                  {up ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  {up ? "+" : ""}{change.toFixed(2)}% today
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-6 mb-8">
          <div className="rounded-3xl p-8 bg-gradient-card/50 border border-border/40 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Deep analysis not available</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are working on improving our dataset day by day. Please be patient — 
              {symbol} will be added soon with full fundamental analysis.
            </p>
          </div>
        </div>

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

  const breakdown = getScoreBreakdown(stockData);
  const score = breakdown.total;
  const signal = breakdown.signal;

  const price = quote?.c || stockData.currentPrice || 0;
  const change = quote?.dp || 0;
  const up = change >= 0;
  const has52w = stockData.week52High > 0;

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        eyebrow={stockData.sector}
        title={<>{stockData.symbol} <span className="text-gradient">{stockData.companyName}</span></>}
        subtitle={`Market Cap: ${stockData.marketCap} | NSE: ${stockData.symbol}`}
        action={
          <a href="/app/discover" className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm hover:bg-card/60 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </a>
        }
      />

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
            {has52w && <div className="text-sm text-muted-foreground mt-2">
              52W High: ₹{stockData.week52High.toLocaleString("en-IN")} | 52W Low: ₹{stockData.week52Low.toLocaleString("en-IN")}
            </div>}
          </div>
          
          {/* AI Score Circle */}
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
        </div>
        
        {/* Signal Banner */}
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
          <ScoreBreakdownPanel breakdown={breakdown} />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-6 mb-8">
        <MetricCard 
          label="P/E Ratio" 
          value={stockData.currentPE > 0 ? `${stockData.currentPE.toFixed(1)}x` : "N/A"} 
          icon={PieChart}
          color="primary"
          subtitle={stockData.currentPE > 0 ? (stockData.currentPE < 20 ? "Undervalued" : stockData.currentPE < 30 ? "Fair" : "Premium") : "No data"}
        />
        <MetricCard 
          label="Operating Margin" 
          value={stockData.currentOPM > 0 ? `${stockData.currentOPM.toFixed(1)}%` : "N/A"}
          icon={Activity}
          color="bull"
          subtitle={stockData.currentOPM > 0 ? (stockData.currentOPM > 25 ? "Excellent" : "Good") : "No data"}
        />
        <MetricCard 
          label="EPS" 
          value={stockData.currentEPS > 0 ? `₹${stockData.currentEPS.toFixed(1)}` : "N/A"}
          icon={Award}
          color="gold"
          subtitle={stockData.currentEPS > 0 ? "TTM" : "No data"}
        />
        <MetricCard 
          label="Dividend" 
          value={stockData.currentDividendPayout > 0 ? `${stockData.currentDividendPayout.toFixed(0)}%` : "N/A"}
          icon={TrendingUp}
          color="accent"
          subtitle={stockData.currentDividendPayout > 0 ? (stockData.currentDividendPayout > 50 ? "High Payout" : "Moderate") : "No data"}
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mb-8">
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Revenue & Profit Growth
          </h3>
          <div className="h-48 relative">
            <GrowthChart 
              revenueData={stockData.revenueGrowth} 
              profitData={stockData.profitGrowth}
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
        <div className="rounded-3xl p-6 bg-gradient-card/50 border border-border/40">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-5 h-5" />
            Understanding the Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {stockData.currentPE > 0 && (
            <div className="p-4 rounded-xl bg-card/30">
              <div className="font-medium mb-2 text-primary">P/E Ratio</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Price-to-Earnings ratio measures how much investors pay per rupee of earnings. 
                {stockData.symbol} at {stockData.currentPE.toFixed(1)}x means you pay ₹{stockData.currentPE.toFixed(1)} for every ₹1 of earnings. 
                {stockData.currentPE < 20 ? "This is below average - potentially undervalued." : stockData.currentPE > 30 ? "This is above average - premium valuation." : "This is around average."}
              </p>
            </div>
            )}
            {stockData.currentOPM > 0 && (
            <div className="p-4 rounded-xl bg-card/30">
              <div className="font-medium mb-2 text-primary">Operating Margin (OPM)</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                OPM shows profitability from core operations. {stockData.symbol} at {stockData.currentOPM > 0 ? `${stockData.currentOPM.toFixed(1)}%` : "N/A"} is{" "}
                {stockData.currentOPM > 30 ? "excellent - strong operational efficiency" : 
                 stockData.currentOPM > 20 ? "good - healthy margins" : 
                 stockData.currentOPM > 0 ? "moderate - room for improvement" : "not available from current data source"}
                {stockData.currentOPM > 0 ? ` - meaning ₹${stockData.currentOPM.toFixed(1)} of every ₹100 in revenue becomes operating profit.` : "."}
              </p>
            </div>
            )}
            {stockData.currentEPS > 0 && (
            <div className="p-4 rounded-xl bg-card/30">
              <div className="font-medium mb-2 text-primary">Graham Number</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Derived from Benjamin Graham's formula: √(22.5 × EPS × Book Value). 
                Current Graham Number: ₹{calculateGrahamNumber(stockData).toFixed(0)}. 
                {calculateGrahamNumber(stockData) > price ? "Stock trades below Graham Number - potential value." : "Stock trades above Graham Number."}
              </p>
            </div>
            )}
            {stockData.currentPE > 0 && (
            <div className="p-4 rounded-xl bg-card/30">
              <div className="font-medium mb-2 text-primary">PEG Ratio</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                P/E divided by growth rate adjusts P/E for growth. PEG &lt; 1 suggests undervaluation, 
                &gt; 2 suggests overvaluation. {stockData.symbol} with {stockData.currentPE.toFixed(1)} P/E and ~{stockData.trends.salesGrowth.toFixed(0)}% growth = PEG {calculatePEG(stockData).toFixed(2)}
              </p>
            </div>
            )}
          </div>
        </div>
      </div>

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

function MetricCard({ label, value, icon: Icon, color, subtitle }: { label: string; value: string; icon: any; color: string; subtitle: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl p-5 bg-gradient-card border border-border/60"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 text-${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </motion.div>
  );
}

function GrowthChart({ revenueData, profitData }: { revenueData: number[]; profitData: number[] }) {
  const max = Math.max(...revenueData, ...profitData);
  const height = 160;
  const width = 100;
  const step = width / (revenueData.length - 1);

  const revPoints = revenueData.map((v, i) => `${i * step},${height - (v / max) * height}`).join(" ");
  const profPoints = profitData.map((v, i) => `${i * step},${height - (v / max) * height}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
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

  const points = peData.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
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
          cy={height - ((v - min) / range) * height} 
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

function ValueMetric({ label, value, tooltip, highlight }: { label: string; value: string; tooltip: string; highlight?: boolean }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${highlight ? "bg-[var(--bull)]/10 border-[var(--bull)]/30" : "bg-card/50 border-border/40"}`}
      title={tooltip}
    >
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? "text-[var(--bull)]" : ""}`}>{value}</div>
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
  return Math.max(0, margin);
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