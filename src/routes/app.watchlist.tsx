import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp, Plus, X, Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useMultipleQuotes } from "@/hooks/useStocks";
import { addQueuedOrder } from "@/lib/orderQueue";
import { useState } from "react";

function isMarketNowOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  return day > 0 && day < 6 && mins >= 555 && mins < 930;
}

export const Route = createFileRoute("/app/watchlist")({
  component: Watchlist,
  head: () => ({ meta: [{ title: "Watchlist — MarketIQ" }, { name: "description", content: "Your watched stocks." }] }),
});

function Watchlist() {
  const { user } = useAuth();
  const { data: watchlist = [], isLoading } = useWatchlist(user?.id ?? null);
  const removeFromWatchlist = useRemoveFromWatchlist();
  const { buy, cashBalance } = usePortfolio(user?.id ?? null);
  const [addTarget, setAddTarget] = useState<{ ticker: string; name: string; price: number } | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const tickers = watchlist.map(w => w.ticker);
  const { data: quotes, isLoading: quotesLoading } = useMultipleQuotes(tickers);

  const marketOpen = isMarketNowOpen();

  const handleRemove = (ticker: string) => {
    if (!user) return;
    removeFromWatchlist.mutate({ userId: user.id, ticker });
  };

  const handleAdd = async () => {
    if (!user?.id || !addTarget) return;
    setAdding(true);
    try {
      if (marketOpen) {
        await buy(addTarget.ticker, addTarget.name, addQty, addTarget.price);
      } else {
        addQueuedOrder(user.id, addTarget.ticker, addTarget.name, "buy", addQty, addTarget.price);
      }
      setAddSuccess(true);
      setTimeout(() => { setAddTarget(null); setAddSuccess(false); }, 1500);
    } catch {
      // handled
    } finally {
      setAdding(false);
    }
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
                        <Link
                          to="/app/analyze/$symbol"
                          params={{ symbol: item.ticker }}
                          className="font-medium hover:text-primary transition"
                        >
                          {item.ticker}
                        </Link>
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setAddTarget({ ticker: item.ticker, name: item.company_name, price });
                              setAddQty(1);
                              setAddSuccess(false);
                            }}
                            className="p-2 hover:bg-card/60 rounded-lg transition text-muted-foreground hover:text-[var(--bull)]"
                            title="Add to portfolio"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(item.ticker)}
                            className="p-2 hover:bg-card/60 rounded-lg transition text-muted-foreground hover:text-[var(--bear)]"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add to Portfolio modal */}
      <AnimatePresence>
        {addTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAddTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-card border border-border/60 rounded-3xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {addSuccess ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Check className="w-10 h-10 text-[var(--bull)] mb-3" />
                  <p className="font-semibold">
                    {marketOpen
                      ? `Added ${addQty} share${addQty > 1 ? "s" : ""} of ${addTarget.ticker}`
                      : `Queued ${addQty} share${addQty > 1 ? "s" : ""} of ${addTarget.ticker}`}
                  </p>
                  {!marketOpen && (
                    <p className="text-xs text-muted-foreground mt-1">Will execute next session</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add to Portfolio</h3>
                    <button onClick={() => setAddTarget(null)} className="p-1 hover:bg-card/60 rounded-lg transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-card/50 border border-border/40 mb-4">
                    <div className="font-medium">{addTarget.ticker}</div>
                    <div className="text-xs text-muted-foreground">{addTarget.name}</div>
                    <div className="mt-2 font-semibold">₹{addTarget.price.toLocaleString("en-IN")} / share</div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {[1, 5, 10, 25].map((q) => (
                      <button
                        key={q}
                        onClick={() => setAddQty(q)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                          addQty === q ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-lg hover:bg-card/80 transition"
                    >
                      –
                    </button>
                    <input
                      type="number"
                      value={addQty}
                      onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center bg-background/50 border border-border/60 rounded-xl py-2.5 text-sm font-semibold focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => setAddQty((q) => q + 1)}
                      className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-lg hover:bg-card/80 transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-card/50 border border-border/40 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-semibold">
                        ₹{(addQty * addTarget.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Available</span>
                      <span>₹{cashBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {!marketOpen && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 mb-4">
                      <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span className="text-xs text-[var(--gold)]">Market closed — order will be queued</span>
                    </div>
                  )}

                  <button
                    onClick={handleAdd}
                    disabled={adding || addQty * addTarget.price > cashBalance}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {adding ? "Adding..." : `Buy ${addQty} Share${addQty > 1 ? "s" : ""}`}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}