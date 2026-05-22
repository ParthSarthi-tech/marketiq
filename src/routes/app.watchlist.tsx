import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trash2, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useMultipleQuotes } from "@/hooks/useStocks";

export const Route = createFileRoute("/app/watchlist")({
  component: Watchlist,
  head: () => ({ meta: [{ title: "Watchlist — MarketIQ" }, { name: "description", content: "Your watched stocks." }] }),
});

function Watchlist() {
  const { user } = useAuth();
  const { data: watchlist = [], isLoading } = useWatchlist(user?.id ?? null);
  const removeFromWatchlist = useRemoveFromWatchlist();

  const tickers = watchlist.map(w => w.ticker);
  const { data: quotes, isLoading: quotesLoading } = useMultipleQuotes(tickers);

  const handleRemove = (ticker: string) => {
    if (!user) return;
    removeFromWatchlist.mutate({ userId: user.id, ticker });
  };

  const isLoadingAny = isLoading || quotesLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Your watchlist"
        title={<>Stocks you're <span className="text-gradient">watching</span>.</>}
        subtitle={watchlist.length > 0 ? `${watchlist.length} stocks tracked` : "No stocks added yet"}
      />

      {isLoadingAny && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoadingAny && watchlist.length === 0 && (
        <div className="text-center py-20">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No stocks in your watchlist</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add stocks from the Discover page</p>
        </div>
      )}

      {!isLoadingAny && watchlist.length > 0 && (
        <div className="rounded-3xl bg-gradient-card border border-border/60 overflow-hidden">
          <div className="p-6 pb-3">
            <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Sorted by recent</span>
          </div>
          <div className="px-2 pb-2 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <th className="text-left font-normal px-4 py-2">Symbol</th>
                  <th className="text-right font-normal px-4 py-2">Price</th>
                  <th className="text-right font-normal px-4 py-2">Change</th>
                  <th className="text-right font-normal px-4 py-2">%</th>
                  <th className="text-right font-normal px-4 py-2">High</th>
                  <th className="text-right font-normal px-4 py-2">Low</th>
                  <th className="text-center font-normal px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item, i) => {
                  const quote = quotes?.[item.ticker];
                  const price = quote?.c || 0;
                  const change = quote?.d || 0;
                  const percent = quote?.dp || 0;
                  const high = quote?.h || 0;
                  const low = quote?.l || 0;
                  const up = change >= 0;

                  return (
                    <motion.tr
                      key={item.ticker}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-t border-border/40 hover:bg-card/40 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.ticker}</div>
                        <div className="text-xs text-muted-foreground">{item.company_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`inline-flex items-center gap-1 ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {up ? "+" : ""}₹{Math.abs(change).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                          {up ? "+" : ""}{percent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        ₹{high.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        ₹{low.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemove(item.ticker)}
                          className="p-2 hover:bg-card/60 rounded-lg transition text-muted-foreground hover:text-[var(--bear)]"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}