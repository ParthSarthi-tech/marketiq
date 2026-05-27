import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { getTransactions } from "@/lib/db";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Transaction History — MarketIQ" },
      { name: "description", content: "View all your buy and sell transactions." },
    ],
  }),
});

function HistoryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => (user?.id ? getTransactions(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    let result = transactions;
    if (filter !== "all") {
      result = result.filter((t) => t.type === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticker.toLowerCase().includes(q) ||
          t.company_name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [transactions, filter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Transaction History"
        subtitle="All your buy and sell transactions"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search by ticker or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/40 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition"
          />
        </div>
        <div className="flex gap-1 bg-card/40 rounded-xl p-1 border border-border/60">
          {(["all", "buy", "sell"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                filter === f
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowUpRight className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-semibold mb-1">
            {transactions.length === 0 ? "No transactions yet" : "No matching transactions"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {transactions.length === 0
              ? "Start building your portfolio to see your transaction history here."
              : "Try adjusting your search or filter."}
          </p>
          {transactions.length === 0 && (
            <Link
              to="/app/discover"
              className="bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-glow"
            >
              Discover stocks
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-card border border-border/60 overflow-hidden">
          <div className="px-2 pb-2 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <th className="text-left font-normal px-4 py-3">Date</th>
                  <th className="text-left font-normal px-4 py-3">Symbol</th>
                  <th className="text-right font-normal px-4 py-3">Type</th>
                  <th className="text-right font-normal px-4 py-3">Qty</th>
                  <th className="text-right font-normal px-4 py-3">Price</th>
                  <th className="text-right font-normal px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-t border-border/40 hover:bg-card/40 transition"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {new Date(txn.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/app/analyze/$symbol"
                        params={{ symbol: txn.ticker }}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {txn.ticker}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        {txn.company_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                          txn.type === "buy"
                            ? "bg-[var(--bull)]/10 text-[var(--bull)]"
                            : "bg-[var(--bear)]/10 text-[var(--bear)]"
                        }`}
                      >
                        {txn.type === "buy" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{txn.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      ₹{txn.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      ₹{txn.total_amount.toLocaleString("en-IN")}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/40 text-[10px] text-muted-foreground font-mono text-center">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
