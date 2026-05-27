import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  Clock,
  Pencil,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, CountUp, Sparkline } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { STOCK_CONFIG, getStockSector } from "@/lib/stockMetadata";
import { getQuotesBatch } from "@/lib/upstox";
import { getResolvedKey } from "@/lib/instrumentResolver";
import { useState, useMemo, useEffect } from "react";
import {
  getQueuedOrders,
  addQueuedOrder,
  cancelQueuedOrder,
  executeQueuedOrders,
  type QueuedOrder,
} from "@/lib/orderQueue";

function getDeterministicSparkline(symbol: string): number[] {
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 8 }, (_, i) => 15 + Math.sin(hash * 0.1 + i) * 10);
}

function generateEquityCurve(total: number): { date: string; value: number; nifty: number }[] {
  if (total <= 0) return [];
  const seed = Math.round(total) % 97 + 1;
  const days = 30;
  const now = new Date();
  const data: { date: string; value: number; nifty: number }[] = [];
  let v = total * 0.82;
  let n = total * 0.78;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const drift = 0.001 + (i === 0 ? 0.002 : 0);
    const noise = Math.sin(seed * 0.5 + i * 0.7) * 0.006 + Math.cos(seed * 0.3 + i * 0.4) * 0.004;
    const niftyNoise = Math.sin(seed * 0.2 + i * 0.5) * 0.005 + Math.cos(seed * 0.7 + i * 0.3) * 0.003;
    v = v * (1 + drift + noise);
    n = n * (1 + 0.0006 + niftyNoise);
    data.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      value: Math.round(v * 100) / 100,
      nifty: Math.round(n * 100) / 100,
    });
  }
  return data;
}

function isMarketOpen(): { open: boolean; message: string } {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  if (day === 0 || day === 6) {
    return { open: false, message: "Markets closed (Weekend)" };
  }
  if (currentTime < marketOpen) {
    return { open: false, message: "Markets open at 9:15 AM" };
  }
  if (currentTime >= marketClose) {
    return { open: false, message: "Markets closed for the day" };
  }
  return { open: true, message: "Markets open" };
}

const TIME_RANGES = ["1W", "1M", "3M", "1Y", "ALL"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

export const Route = createFileRoute("/app/portfolio")({
  component: Portfolio,
  head: () => ({
    meta: [
      { title: "Portfolio — MarketIQ" },
      {
        name: "description",
        content: "Your virtual portfolio holdings, allocation and performance.",
      },
    ],
  }),
});

const SECTOR_COLORS: Record<string, string> = {
  Automobile: "oklch(0.58 0.24 15)",
  Chemicals: "oklch(0.60 0.20 310)",
  "Consumer Discretionary": "oklch(0.72 0.20 95)",
  "Consumer Durables": "oklch(0.70 0.22 135)",
  Energy: "oklch(0.62 0.22 55)",
  "Energy & Petrochemicals": "oklch(0.60 0.18 200)",
  FMCG: "oklch(0.75 0.18 60)",
  "Financial Services": "oklch(0.74 0.24 40)",
  Healthcare: "oklch(0.70 0.22 155)",
  "Information Technology": "oklch(0.78 0.20 145)",
  Infrastructure: "oklch(0.68 0.20 260)",
  "Metals & Mining": "oklch(0.55 0.18 40)",
  Services: "oklch(0.58 0.20 220)",
  Telecommunication: "oklch(0.65 0.20 280)",
  default: "oklch(0.5 0.08 200)",
};

function Portfolio() {
  const { user } = useAuth();
  const {
    holdings,
    totalValue,
    totalInvested,
    totalPL,
    totalPLPercent,
    cashBalance,
    sectorAllocation,
    loading,
    buy,
    sell,
    editHolding,
    deleteHolding,
    isBuying,
    isSelling,
  } = usePortfolio(user?.id ?? null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string } | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buying, setBuying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [filterSector, setFilterSector] = useState<string | null>(null);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<(typeof holdings)[0] | null>(null);
  const [holdingQuantity, setHoldingQuantity] = useState(1);
  const [holdingAction, setHoldingAction] = useState<"buy" | "sell" | null>(null);
  const [performingAction, setPerformingAction] = useState(false);
  const [showEditHolding, setShowEditHolding] = useState(false);
  const [editAvgPrice, setEditAvgPrice] = useState<number | "">("");
  const [editQuantity, setEditQuantity] = useState<number | "">("");
  const [editing, setEditing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [targetPcts, setTargetPcts] = useState<Record<string, number>>({});
  const marketStatus = isMarketOpen();
  const [orders, setOrders] = useState<QueuedOrder[]>([]);
  const [executedCount, setExecutedCount] = useState(0);

  useEffect(() => {
    setOrders(getQueuedOrders());
  }, []);

  useEffect(() => {
    if (!marketStatus.open) return;
    const pending = getQueuedOrders().filter((o) => o.status === "queued");
    if (pending.length === 0) return;
    const count = executeQueuedOrders(buy, sell);
    if (count > 0) {
      setExecutedCount(count);
      setOrders(getQueuedOrders());
    }
  }, [marketStatus.open]);

  useEffect(() => {
    if (executedCount === 0) return;
    const t = setTimeout(() => setExecutedCount(0), 5000);
    return () => clearTimeout(t);
  }, [executedCount]);

  const filteredHoldings = filterSector
    ? holdings.filter((h) => getStockSector(h.ticker) === filterSector)
    : holdings;

  const handleExport = () => {
    const csvContent = [
      ["Symbol", "Company", "Quantity", "Avg Price", "Current Price", "P/L", "P/L %"].join(","),
      ...holdings.map((h) =>
        [
          h.ticker,
          h.company_name,
          h.quantity,
          h.avg_buy_price,
          h.currentPrice,
          h.pl?.toFixed(2) || 0,
          h.plPercent?.toFixed(2) || 0,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sectors = Object.keys(sectorAllocation);

  const filteredStocks = Object.values(STOCK_CONFIG).filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStockSelect = (stock: { ticker: string; name: string }) => {
    setSelectedStock(stock);
    setSearchQuery(stock.name);
    setShowStockDropdown(false);
    setLoadingPrice(true);
    const key = getResolvedKey(stock.ticker);
    if (key) {
      getQuotesBatch([key])
        .then((q) => {
          const quote = q[key];
          setCurrentPrice(quote?.lastPrice || 0);
          setLoadingPrice(false);
        })
        .catch(() => setLoadingPrice(false));
    } else {
      setCurrentPrice(0);
      setLoadingPrice(false);
    }
  };

  const effectivePrice = customPrice === "" ? currentPrice : customPrice;
  const totalCost = quantity * effectivePrice;

  const handleBuy = async () => {
    if (!user?.id || !selectedStock || effectivePrice <= 0 || totalCost > cashBalance) return;
    setBuying(true);
    try {
      if (marketStatus.open) {
        await buy(selectedStock.ticker, selectedStock.name, quantity, effectivePrice);
      } else {
        addQueuedOrder(
          selectedStock.ticker,
          selectedStock.name,
          "buy",
          quantity,
          effectivePrice,
        );
        setOrders(getQueuedOrders());
      }
      setShowAddModal(false);
      setSelectedStock(null);
      setQuantity(10);
      setCustomPrice("");
      setSearchQuery("");
    } catch (e) {
      console.error(e);
    } finally {
      setBuying(false);
    }
  };

  let acc = 0;
  const ringR = 70;
  const C = 2 * Math.PI * ringR;

  const totalAllocation = Object.values(sectorAllocation).reduce((a, b) => a + b, 0);
  const sectorData = Object.entries(sectorAllocation).map(([label, value]) => ({
    label,
    pct: totalAllocation > 0 ? (value / totalAllocation) * 100 : 0,
    color: SECTOR_COLORS[label] || SECTOR_COLORS.default,
  }));

  useEffect(() => {
    if (Object.keys(targetPcts).length > 0) return;
    if (sectorData.length === 0) return;
    const eq = 100 / sectorData.length;
    setTargetPcts(Object.fromEntries(sectorData.map((s) => [s.label, eq])));
  }, [sectorData.length]);

  return (
    <div>
      <PageHeader
        eyebrow="Virtual portfolio"
        title={
          <>
            Built brick by <span className="text-gradient">brick</span>.
          </>
        }
        subtitle={`${holdings.length} holdings · ₹${cashBalance.toLocaleString("en-IN")} cash available`}
        action={
          <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowSectorDropdown(!showSectorDropdown)}
                  className={`inline-flex items-center gap-2 glass text-sm px-4 py-2.5 rounded-xl hover:bg-card/60 transition ${filterSector ? "bg-primary/20 text-primary border border-primary/30" : ""}`}
                >
                  <Filter className="w-4 h-4" /> {filterSector || "Filter"}
                </button>
                {showSectorDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-background border border-border/60 rounded-xl shadow-lg overflow-hidden z-20 min-w-[200px]">
                    {sectors.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setFilterSector(s); setShowSectorDropdown(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-card/60 transition ${filterSector === s ? "bg-primary/10 text-primary font-medium" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                    {filterSector && (
                      <button
                        onClick={() => { setFilterSector(null); setShowSectorDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-card/60 border-t border-border/40"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                )}
              </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 glass text-sm px-4 py-2.5 rounded-xl hover:bg-card/60 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" /> Add holding
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Invested"
          value={
            <>
              <span className="text-muted-foreground text-xl">₹</span>
              <CountUp to={Math.round(totalInvested)} />
            </>
          }
        />
        <StatCard
          label="Current value"
          value={
            <>
              <span className="text-muted-foreground text-xl">₹</span>
              <CountUp to={Math.round(totalValue)} />
            </>
          }
          delta={
            totalPLPercent >= 0 ? `+${totalPLPercent.toFixed(1)}%` : `${totalPLPercent.toFixed(1)}%`
          }
          trend={totalPLPercent >= 0 ? "up" : "down"}
        />
        <StatCard
          label="Available Cash"
          value={
            <>
              <span className="text-muted-foreground text-xl">₹</span>
              <CountUp to={Math.round(cashBalance)} />
            </>
          }
          delta="ready to invest"
          trend="up"
        />
        <StatCard
          label="Total P/L"
          value={
            <>
              <span className="text-muted-foreground text-xl">₹</span>
              <CountUp to={Math.round(totalPL)} />
            </>
          }
          delta={totalPL >= 0 ? "profit" : "loss"}
          trend={totalPL >= 0 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Allocation donut */}
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="font-semibold mb-1">Sector allocation</div>
          <div className="text-xs text-muted-foreground mb-4">
            Diversification health:{" "}
            <span
              className={`font-semibold ${sectorData.length >= 4 ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}
            >
              {sectorData.length >= 5 ? "Strong" : sectorData.length >= 3 ? "Good" : "Building"}
            </span>
          </div>
          <div className="flex items-center justify-center my-4">
            <svg viewBox="0 0 200 200" className="w-52 h-52">
              <circle
                cx="100"
                cy="100"
                r={ringR}
                fill="none"
                stroke="oklch(1 0 0 / 0.06)"
                strokeWidth="22"
              />
              {sectorData.map((a) => {
                const len = (C * a.pct) / 100;
                const dashArray = `${Math.max(len - 1, 0)} ${C - len}`;
                const seg = (
                  <motion.circle
                    key={a.label}
                    cx="100"
                    cy="100"
                    r={ringR}
                    fill="none"
                    stroke={a.color}
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-acc}
                    initial={{ strokeDashoffset: 0, opacity: 0 }}
                    animate={{ strokeDashoffset: -acc, opacity: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                  />
                );
                acc += len;
                return seg;
              })}
              <text
                x="100" y="88"
                textAnchor="middle"
                fill="oklch(0.6 0 0)"
                fontSize="11"
                fontFamily="monospace"
                letterSpacing="0.1em"
              >
                TOTAL
              </text>
              <text
                x="100" y="115"
                textAnchor="middle"
                fill="oklch(0.9 0 0)"
                fontSize="18"
                fontWeight="600"
                fontFamily="var(--font-display, inherit)"
              >
                ₹{(totalValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </text>
            </svg>
          </div>
          <div className="space-y-2">
            {sectorData.map((a) => (
              <div key={a.label} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                <span className="flex-1">{a.label}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {a.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders section */}
        <div className="rounded-3xl bg-gradient-card border border-border/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="font-semibold">Orders</div>
              {orders.filter((o) => o.status === "queued").length > 0 && (
                <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {orders.filter((o) => o.status === "queued").length} pending
                </span>
              )}
            </div>
            {executedCount > 0 && (
              <span className="text-xs text-[var(--bull)]">
                {executedCount} order{executedCount > 1 ? "s" : ""} auto-executed
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              {!marketStatus.open && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Orders placed while markets are closed will queue here
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                    order.status === "queued"
                      ? "border-yellow-500/20 bg-yellow-500/5"
                      : order.status === "executed"
                        ? "border-[var(--bull)]/20 bg-[var(--bull)]/5"
                        : "border-border/40 bg-card/40"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {order.ticker}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          order.type === "buy"
                            ? "bg-[var(--bull)]/10 text-[var(--bull)]"
                            : "bg-[var(--bear)]/10 text-[var(--bear)]"
                        }`}
                      >
                        {order.type.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          order.status === "queued"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : order.status === "executed"
                              ? "bg-[var(--bull)]/10 text-[var(--bull)]"
                              : "bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.quantity} × ₹{order.price.toLocaleString("en-IN")}
                      <span className="mx-1">·</span>
                      ₹{order.totalCost.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {order.status === "queued" && (
                    <button
                      onClick={() => {
                        cancelQueuedOrder(order.id);
                        setOrders(getQueuedOrders());
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border/40 hover:border-border"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance chart */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold">Performance vs NIFTY 50</div>
              <div className="text-xs text-muted-foreground">
                {timeRange === "1W"
                  ? "Last 7 days"
                  : timeRange === "1M"
                    ? "Last 30 days"
                    : timeRange === "3M"
                      ? "Last 90 days"
                      : timeRange === "1Y"
                        ? "Last 365 days"
                        : "All time"}
              </div>
            </div>
            <div className="flex gap-1 text-[10px] font-mono">
              {TIME_RANGES.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p)}
                  className={`px-2.5 py-1 rounded-lg ${timeRange === p ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <PerformanceChart totalValue={totalValue} />
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[var(--bull)]" /> Your portfolio
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-0.5 bg-muted-foreground" /> NIFTY 50
            </span>
          </div>
        </div>
      </div>

      {/* Rebalancing Tool */}
      <div className="rounded-3xl bg-gradient-card border border-border/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Rebalancing</div>
          <button
            onClick={() => {
              const equal = 100 / sectorData.length;
              setTargetPcts(Object.fromEntries(sectorData.map((s) => [s.label, equal])));
            }}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border/40"
          >
            Equal weight
          </button>
        </div>

        {sectorData.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Add holdings to see rebalancing suggestions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <th className="text-left font-normal px-3 py-2">Sector</th>
                  <th className="text-right font-normal px-3 py-2">Current</th>
                  <th className="text-right font-normal px-3 py-2">Target</th>
                  <th className="text-right font-normal px-3 py-2">Diff</th>
                  <th className="text-right font-normal px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {sectorData.map((s) => {
                  const target = targetPcts[s.label] ?? 0;
                  const diff = target - s.pct;
                  const action = diff > 0.5 ? "Buy" : diff < -0.5 ? "Sell" : "—";
                  const value = (target / 100) * totalValue;
                  const currentValue = (s.pct / 100) * totalValue;
                  const needValue = Math.abs(value - currentValue);
                  return (
                    <motion.tr
                      key={s.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-border/40"
                    >
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                          <span className="text-xs">{s.label}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                        {s.pct.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <input
                          type="number"
                          value={targetPcts[s.label]?.toFixed(1) ?? ""}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setTargetPcts((prev) => ({
                              ...prev,
                              [s.label]: isNaN(v) ? 0 : v,
                            }));
                          }}
                          className="w-16 text-right bg-background/50 border border-border/60 rounded-lg py-1 px-2 text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-primary/50"
                          step="0.5"
                        />
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right tabular-nums text-xs font-medium ${
                          Math.abs(diff) < 0.5
                            ? "text-muted-foreground"
                            : diff > 0
                              ? "text-[var(--bull)]"
                              : "text-[var(--bear)]"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {action !== "—" ? (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              action === "Buy"
                                ? "bg-[var(--bull)]/10 text-[var(--bull)]"
                                : "bg-[var(--bear)]/10 text-[var(--bear)]"
                            }`}
                          >
                            {action} ~₹{needValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Holdings table */}
      <div className="rounded-3xl bg-gradient-card border border-border/60 overflow-hidden">
        <div className="p-6 pb-3 flex items-center justify-between">
          <div className="font-semibold">
            Holdings <span className="text-muted-foreground font-normal">· {holdings.length}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
            Sorted by allocation
          </span>
        </div>
        <div className="px-2 pb-2 overflow-x-auto">
          {filteredHoldings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-card/60 flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-muted-foreground" />
              </div>
              {holdings.length === 0 ? (
                <>
                  <p className="font-semibold mb-1">No holdings yet</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Start building your portfolio by discovering stocks and making your first buy.
                  </p>
                  <Link
                    to="/app/discover"
                    className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-glow"
                  >
                    <Search className="w-4 h-4" /> Discover stocks
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-1">No matching holdings</p>
                  <p className="text-sm text-muted-foreground">
                    Try clearing the sector filter to see all holdings.
                  </p>
                  {filterSector && (
                    <button
                      onClick={() => setFilterSector(null)}
                      className="mt-4 text-sm text-primary hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <th className="text-left font-normal px-4 py-2">Symbol</th>
                  <th className="text-right font-normal px-4 py-2">Qty</th>
                  <th className="text-right font-normal px-4 py-2">Avg</th>
                  <th className="text-right font-normal px-4 py-2">LTP</th>
                  <th className="text-left font-normal px-4 py-2 hidden md:table-cell">Trend</th>
                  <th className="text-right font-normal px-4 py-2">P/L</th>
                  <th className="text-right font-normal px-4 py-2">Alloc</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((h, i) => {
                  const up = h.pl >= 0;
                  const allocPercent = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
                  return (
                    <motion.tr
                      key={h.ticker}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedHolding(h)}
                      className="border-t border-border/40 hover:bg-card/40 transition cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted-foreground">
                          {h.company_name || h.ticker}
                        </div>
                        <div className="font-medium">{h.ticker}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{h.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        ₹{h.avg_buy_price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        ₹{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell w-[140px]">
                        <Sparkline values={getDeterministicSparkline(h.ticker)} positive={up} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}
                        >
                          {up ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {up ? "+" : ""}₹
                          {Math.abs(Math.round(h.pl)).toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {up ? "+" : ""}
                          {h.plPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${allocPercent}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05 }}
                              className="h-full bg-gradient-primary"
                            />
                          </div>
                          <span className="font-mono text-xs tabular-nums w-8">
                            {allocPercent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-card border border-border/60 rounded-3xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add Holding</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-card/60 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Search Stock</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowStockDropdown(true);
                      }}
                      onFocus={() => setShowStockDropdown(true)}
                      placeholder="Search Indian stocks..."
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                    {showStockDropdown && filteredStocks.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/60 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                        {filteredStocks.slice(0, 6).map((s) => (
                          <button
                            key={s.ticker}
                            onClick={() => handleStockSelect(s)}
                            className="w-full px-4 py-2 text-left hover:bg-card/60 transition text-sm"
                          >
                            <span className="font-mono text-primary">{s.ticker}</span>
                            <span className="text-muted-foreground ml-2">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedStock && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold">{selectedStock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{selectedStock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground">LTP</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Price (optional)
                    </label>
                    <input
                      type="number"
                      placeholder={`₹${currentPrice.toFixed(2)}`}
                      value={customPrice}
                      onChange={(e) =>
                        setCustomPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                      }
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="p-4 bg-card/50 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-semibold">
                      ₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Available Cash</span>
                    <span
                      className={
                        totalCost > cashBalance ? "text-[var(--bear)]" : "text-[var(--bull)]"
                      }
                    >
                      ₹{cashBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {totalCost > cashBalance && (
                    <div className="text-xs text-[var(--bear)] mt-2">Insufficient funds</div>
                  )}
                </div>

                {!marketStatus.open && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30">
                    <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
                    <span className="text-xs text-[var(--gold)]">Market closed — order will be queued</span>
                  </div>
                )}

                <button
                  onClick={handleBuy}
                  disabled={
                    !selectedStock ||
                    effectivePrice <= 0 ||
                    totalCost > cashBalance ||
                    buying
                  }
                  className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {buying
                    ? "Processing..."
                    : marketStatus.open
                      ? `Buy ${quantity} Share${quantity > 1 ? "s" : ""}`
                      : `Queue ${quantity} Share${quantity > 1 ? "s" : ""}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holding Detail Modal */}
      <AnimatePresence>
        {selectedHolding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedHolding(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-card border border-border/60 rounded-3xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedHolding.ticker}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedHolding.company_name || selectedHolding.ticker}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHolding(null)}
                  className="p-2 hover:bg-card/60 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                  <div className="text-2xl font-bold">{selectedHolding.quantity}</div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Avg Cost</div>
                  <div className="text-2xl font-bold">
                    ₹{selectedHolding.avg_buy_price.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="text-2xl font-bold">
                    ₹
                    {selectedHolding.currentPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                  <div className="text-2xl font-bold">
                    ₹{selectedHolding.currentValue.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">P/L</div>
                  <div
                    className={`text-2xl font-bold ${selectedHolding.pl >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}
                  >
                    {selectedHolding.pl >= 0 ? "+" : ""}₹
                    {Math.abs(Math.round(selectedHolding.pl)).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">P/L %</div>
                  <div
                    className={`text-2xl font-bold ${selectedHolding.plPercent >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}
                  >
                    {selectedHolding.plPercent >= 0 ? "+" : ""}
                    {selectedHolding.plPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Market Status */}
              <div
                className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${marketStatus.open ? "bg-[var(--bull)]/10 border border-[var(--bull)]/30" : "bg-[var(--gold)]/10 border border-[var(--gold)]/30"}`}
              >
                <Clock
                  className={`w-4 h-4 ${marketStatus.open ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}
                />
                <span
                  className={`text-sm ${marketStatus.open ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}
                >
                  {marketStatus.message}
                </span>
              </div>

              {/* Buy/Sell Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setHoldingAction("buy");
                    setHoldingQuantity(1);
                    setShowEditHolding(false);
                  }}
                  disabled={!marketStatus.open}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[var(--bull)]/15 text-[var(--bull)] border border-[var(--bull)]/30 hover:bg-[var(--bull)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus className="w-4 h-4" /> Buy
                </button>
                <button
                  onClick={() => {
                    setHoldingAction("sell");
                    setHoldingQuantity(1);
                    setShowEditHolding(false);
                  }}
                  disabled={!marketStatus.open}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[var(--bear)]/15 text-[var(--bear)] border border-[var(--bear)]/30 hover:bg-[var(--bear)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <TrendingDown className="w-4 h-4" /> Sell
                </button>
                <button
                  onClick={() => {
                    setShowEditHolding(!showEditHolding);
                    setHoldingAction(null);
                    setEditAvgPrice(selectedHolding.avg_buy_price);
                    setEditQuantity(selectedHolding.quantity);
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-card/50 border border-border/40 hover:bg-card/80 transition text-sm"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              </div>

              {/* Quick Actions Form */}
              {holdingAction && marketStatus.open && !showEditHolding && (
                <div className="mt-4 p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setHoldingQuantity(1)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${holdingQuantity === 1 ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"}`}
                    >
                      1
                    </button>
                    <button
                      onClick={() => setHoldingQuantity(5)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${holdingQuantity === 5 ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"}`}
                    >
                      5
                    </button>
                    <button
                      onClick={() => setHoldingQuantity(10)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${holdingQuantity === 10 ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"}`}
                    >
                      10
                    </button>
                    <button
                      onClick={() => setHoldingQuantity(selectedHolding.quantity)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${holdingQuantity === selectedHolding.quantity ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"}`}
                    >
                      All
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 rounded-xl bg-card border border-border/40">
                      <div className="text-xs text-muted-foreground">Quantity</div>
                      <div className="text-xl font-bold">{holdingQuantity}</div>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-card border border-border/40">
                      <div className="text-xs text-muted-foreground">Value</div>
                      <div className="text-xl font-bold">
                        ₹{(holdingQuantity * selectedHolding.currentPrice).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user?.id) return;
                      setPerformingAction(true);
                      try {
                        if (marketStatus.open) {
                          if (holdingAction === "buy") {
                            await buy(
                              selectedHolding.ticker,
                              selectedHolding.company_name || selectedHolding.ticker,
                              holdingQuantity,
                              selectedHolding.currentPrice,
                            );
                          } else {
                            await sell(
                              selectedHolding.ticker,
                              holdingQuantity,
                              selectedHolding.currentPrice,
                            );
                          }
                        } else {
                          addQueuedOrder(
                            selectedHolding.ticker,
                            selectedHolding.company_name || selectedHolding.ticker,
                            holdingAction,
                            holdingQuantity,
                            selectedHolding.currentPrice,
                          );
                          setOrders(getQueuedOrders());
                        }
                        setSelectedHolding(null);
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setPerformingAction(false);
                      }
                    }}
                    disabled={
                      performingAction ||
                      (holdingAction === "sell" && holdingQuantity > selectedHolding.quantity) ||
                      (holdingAction === "buy" &&
                        holdingQuantity * selectedHolding.currentPrice > cashBalance)
                    }
                    className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 ${holdingAction === "buy" ? "bg-[var(--bull)] text-[var(--bull)] hover:bg-[var(--bull)]/20" : "bg-[var(--bear)] text-[var(--bear)] hover:bg-[var(--bear)]/20"}`}
                  >
                    {performingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {holdingAction === "buy"
                      ? `Buy ${holdingQuantity} Share${holdingQuantity > 1 ? "s" : ""}`
                      : `Sell ${holdingQuantity} Share${holdingQuantity > 1 ? "s" : ""}`}
                  </button>
                </div>
              )}

              {/* Edit Holding Form */}
              {showEditHolding && (
                <div className="mt-4 p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Edit Holding</span>
                    <button
                      onClick={() => setShowEditHolding(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                        Avg. Buy Price
                      </label>
                      <input
                        type="number"
                        value={editAvgPrice}
                        onChange={(e) =>
                          setEditAvgPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                        }
                        className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) =>
                          setEditQuantity(e.target.value === "" ? "" : parseInt(e.target.value))
                        }
                        className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!user?.id || editAvgPrice === "" || editQuantity === "") return;
                        setEditing(true);
                        try {
                          await editHolding(selectedHolding.ticker, {
                            avg_buy_price: editAvgPrice as number,
                            quantity: editQuantity as number,
                          });
                          setSelectedHolding(null);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setEditing(false);
                        }
                      }}
                      disabled={
                        editing ||
                        editAvgPrice === "" ||
                        editQuantity === "" ||
                        (editAvgPrice as number) <= 0 ||
                        (editQuantity as number) < 0
                      }
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Save Changes
                    </button>
                    <button
                      onClick={async () => {
                        if (!user?.id) return;
                        setEditing(true);
                        try {
                          await deleteHolding(selectedHolding.ticker);
                          setSelectedHolding(null);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setEditing(false);
                        }
                      }}
                      disabled={editing}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bear)]/15 text-[var(--bear)] border border-[var(--bear)]/30 hover:bg-[var(--bear)]/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <TrendingDown className="w-4 h-4" /> Delete All
                    </button>
                  </div>
                </div>
              )}

              <Link
                to="/app/analyze/$symbol"
                params={{ symbol: selectedHolding.ticker }}
                className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary transition"
              >
                <BarChart3 className="w-4 h-4" /> View Full Analysis
                <ExternalLink className="w-3 h-3" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PerformanceChart({ totalValue: tv }: { totalValue: number }) {
  const data = useMemo(() => generateEquityCurve(tv), [tv]);
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--bull)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--bull)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="niftyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.15 200)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="oklch(0.6 0.15 200)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
          width={50}
          domain={["dataMin - 500", "dataMax + 500"]}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                <div className="text-muted-foreground mb-1">{label}</div>
                {payload.map((p) => (
                  <div key={p.dataKey} className="flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span>{p.name === "value" ? "Portfolio" : "NIFTY 50"}</span>
                    <span className="font-semibold tabular-nums">
                      ₹{p.value?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="nifty"
          stroke="oklch(0.6 0.15 200)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="url(#niftyGradient)"
          dot={false}
          activeDot={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--bull)"
          strokeWidth={2}
          fill="url(#portfolioGradient)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: "var(--bull)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
