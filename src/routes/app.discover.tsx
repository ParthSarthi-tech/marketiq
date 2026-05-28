import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Check,
  Search,
  Loader2,
  X,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { PageHeader, Sparkline } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { useIndianStocks, useStockSearch } from "@/hooks/useStocks";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useUserProfile } from "@/hooks/useUserProfile";
import { loadStockData, getStockScore } from "@/lib/stockData";
import { getStockSector, PROFILE_STOCKS } from "@/lib/stockMetadata";
import type { StockSet } from "@/lib/stockMetadata";

const SET_ICONS = [
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  Plus,
] as const;

function getDeterministicSparkline(symbol: string): number[] {
  const stockData = loadStockData(symbol);
  if (!stockData?.revenueGrowth || stockData.revenueGrowth.length < 8) {
    const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 8 }, (_, i) => 15 + Math.sin(hash + i) * 10);
  }
  const growth = stockData.revenueGrowth.slice(-8);
  const max = Math.max(...growth);
  const min = Math.min(...growth);
  const range = max - min || 1;
  return growth.map((v) => 10 + ((v - min) / range) * 20);
}

export const Route = createFileRoute("/app/discover")({
  component: Discover,
  head: () => ({
    meta: [
      { title: "Discover — MarketIQ" },
      {
        name: "description",
        content: "AI-matched stock picks based on your goals, risk and horizon.",
      },
    ],
  }),
});

function Discover() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id ?? null);
  const { data: allStocks, isLoading: stocksLoading } = useIndianStocks();
  const { data: watchlist = [] } = useWatchlist(user?.id ?? null);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const riskProfile = (profile?.risk_appetite || "med-high") as keyof typeof PROFILE_STOCKS;
  const stockSets = PROFILE_STOCKS[riskProfile] || PROFILE_STOCKS["med-high"];

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const { data: searchResults, isLoading: searchLoading } = useStockSearch(debouncedSearch);

  const watchlistTickers = new Set(watchlist.map((w) => w.ticker));

  const stocksByTicker = new Map(allStocks?.map((s) => [s.symbol, s]) || []);

  const getMatchScore = useCallback((symbol: string) => {
    const data = loadStockData(symbol);
    if (data) {
      return Math.min(99, Math.max(40, getStockScore(data)));
    }
    return 75;
  }, []);

  const toggleWatchlist = (ticker: string, name: string) => {
    if (!user) return;
    if (watchlistTickers.has(ticker)) {
      removeFromWatchlist.mutate({ userId: user.id, ticker });
    } else {
      addToWatchlist.mutate({ userId: user.id, ticker, companyName: name });
    }
  };

  const profileLabel =
    riskProfile === "high" ? "aggressive" :
    riskProfile === "med-high" ? "moderate-aggressive" :
    riskProfile === "med-low" ? "moderate" : "conservative";

  return (
    <div>
      <PageHeader
        eyebrow="Discover"
        title={
          <>
            Stocks picked <span className="text-gradient">for you</span>.
          </>
        }
        subtitle={`5 sets matched to your ${profileLabel} profile`}
        action={
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-mono hover:bg-card/60 transition"
          >
            <Search className="w-3 h-3" /> Search stocks
          </button>
        }
      />

      {showSearch && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-card border border-border/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NSE stocks (e.g., RELIANCE, TCS, INFY)"
              className="w-full bg-background/40 border border-border/60 rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {searchLoading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-3 space-y-1">
              {searchResults.slice(0, 5).map((s) => (
                <Link
                  key={s.instrument_key}
                  to="/app/analyze/$symbol"
                  params={{ symbol: s.trading_symbol }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-card/40 transition"
                >
                  <div>
                    <span className="font-medium">{s.trading_symbol}</span>
                    <span className="text-xs text-muted-foreground ml-2">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWatchlist(s.trading_symbol, s.name);
                      }}
                      className={`text-xs px-2 py-1 rounded ${watchlistTickers.has(s.trading_symbol) ? "text-[var(--bull)]" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {watchlistTickers.has(s.trading_symbol) ? "Watching" : "Add"}
                    </button>
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {stocksLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-10">
          {stockSets.map((set, si) => {
            const SetIcon = SET_ICONS[si % SET_ICONS.length];
            return (
              <div key={set.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <SetIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{set.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {riskProfile === "high" ? "High conviction picks" :
                       riskProfile === "low" ? "Safe & steady picks" :
                       "Balanced opportunities"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {set.tickers.map((ticker, ti) => {
                    const s = stocksByTicker.get(ticker);
                    if (!s) return null;
                    const inWatchlist = watchlistTickers.has(ticker);
                    const up = (s.quote?.dp || 0) >= 0;
                    const match = getMatchScore(ticker);
                    const sector = getStockSector(ticker);
                    return (
                      <motion.div
                        key={ticker}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ti * 0.06 + si * 0.1, duration: 0.4 }}
                        className="relative rounded-3xl p-6 bg-gradient-card border border-border/60 hover:border-primary/40 transition overflow-hidden group"
                      >
                        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-10 blur-3xl transition" />
                        <div className="flex items-start justify-between mb-3 relative">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">NSE</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-card/60 text-muted-foreground">{sector}</span>
                            </div>
                            <div className="font-display text-xl font-semibold">{ticker}</div>
                            <div className="text-xs text-muted-foreground">{s.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                              <Sparkles className="w-3 h-3" /> {match}% match
                            </div>
                          </div>
                        </div>
                        <div className="flex items-end justify-between mb-3 relative">
                          <div>
                            <div className="font-mono text-2xl font-semibold tabular-nums">
                              ₹{s.quote?.c?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "—"}
                            </div>
                            <div className={`text-xs font-semibold ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                              {up ? "+" : ""}{s.quote?.dp?.toFixed(2) || "0.00"}% today
                            </div>
                          </div>
                          <div className="w-32">
                            <Sparkline values={getDeterministicSparkline(ticker)} positive={up} />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 relative">{s.thesis}</p>
                        <div className="flex gap-2 relative">
                          <Link
                            to="/app/analyze/$symbol"
                            params={{ symbol: ticker }}
                            className="flex-1 text-sm font-medium px-4 py-2.5 rounded-xl glass hover:bg-card/60 transition flex items-center justify-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" /> Analyze
                          </Link>
                          <button
                            onClick={() => toggleWatchlist(ticker, s.name)}
                            disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                              inWatchlist
                                ? "bg-[var(--bull)]/15 text-[var(--bull)] border border-[var(--bull)]/40"
                                : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                            }`}
                          >
                            {inWatchlist ? <><Check className="w-4 h-4" /> Watching</> : <><Plus className="w-4 h-4" /> Watch</>}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
