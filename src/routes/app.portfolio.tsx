import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Download, ArrowUpRight, ArrowDownRight, X, Search, Loader2, TrendingUp, TrendingDown, BarChart3, ExternalLink, Clock } from "lucide-react";
import { PageHeader, StatCard, CountUp, Sparkline } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { STOCK_CONFIG } from "@/lib/stockMetadata";
import { getQuotesBatch } from "@/lib/upstox";
import { addToPortfolio, addTransaction, updateUserCashBalance } from "@/lib/db";
import { getResolvedKey } from "@/lib/instrumentResolver";
import { useState } from "react";

function getDeterministicSparkline(symbol: string): number[] {
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 8 }, (_, i) => 15 + Math.sin(hash * 0.1 + i) * 10);
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
type TimeRange = typeof TIME_RANGES[number];

export const Route = createFileRoute("/app/portfolio")({
  component: Portfolio,
  head: () => ({ meta: [{ title: "Portfolio — MarketIQ" }, { name: "description", content: "Your virtual portfolio holdings, allocation and performance." }] }),
});

const SECTOR_COLORS: Record<string, string> = {
  IT: "oklch(0.78 0.18 155)",
  Banking: "oklch(0.85 0.16 90)",
  Energy: "oklch(0.68 0.20 195)",
  NBFC: "oklch(0.72 0.22 320)",
  FMCG: "oklch(0.75 0.18 60)",
  "Capital Goods": "oklch(0.70 0.18 260)",
  Telecom: "oklch(0.65 0.18 280)",
  Pharma: "oklch(0.72 0.18 160)",
  default: "oklch(0.6 0.15 200)",
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
    loading 
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
  const [selectedHolding, setSelectedHolding] = useState<typeof holdings[0] | null>(null);
  const [holdingQuantity, setHoldingQuantity] = useState(1);
  const [holdingAction, setHoldingAction] = useState<"buy" | "sell">("buy");
  const [performingAction, setPerformingAction] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const marketStatus = isMarketOpen();

  const filteredHoldings = filterSector 
    ? holdings.filter((_, i) => i === 0 || SECTOR_COLORS[Object.keys(sectorAllocation)[i % Object.keys(sectorAllocation).length]] === SECTOR_COLORS[filterSector])
    : holdings;

  const handleExport = () => {
    const csvContent = [
      ["Symbol", "Company", "Quantity", "Avg Price", "Current Price", "P/L", "P/L %"].join(","),
      ...holdings.map(h => [
        h.ticker, h.company_name, h.quantity, h.avg_buy_price, h.currentPrice, h.pl?.toFixed(2) || 0, h.plPercent?.toFixed(2) || 0
      ].join(","))
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

  const filteredStocks = Object.values(STOCK_CONFIG).filter(s => 
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockSelect = (stock: { ticker: string; name: string }) => {
    setSelectedStock(stock);
    setSearchQuery(stock.name);
    setShowStockDropdown(false);
    setLoadingPrice(true);
    const key = getResolvedKey(stock.ticker);
    if (key) {
      getQuotesBatch([key]).then(q => {
        const quote = q[key];
        setCurrentPrice(quote?.lastPrice || 0);
        setLoadingPrice(false);
      }).catch(() => setLoadingPrice(false));
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
      await addToPortfolio(user.id, {
        ticker: selectedStock.ticker,
        company_name: selectedStock.name,
        quantity,
        avg_buy_price: effectivePrice,
      });
      await addTransaction(user.id, {
        ticker: selectedStock.ticker,
        company_name: selectedStock.name,
        type: "buy",
        quantity,
        price: effectivePrice,
        total_amount: totalCost,
      });
      await updateUserCashBalance(user.id, cashBalance - totalCost);
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

  return (
    <div>
      <PageHeader
        eyebrow="Virtual portfolio"
        title={<>Built brick by <span className="text-gradient">brick</span>.</>}
        subtitle={`${holdings.length} holdings · ₹${cashBalance.toLocaleString("en-IN")} cash available`}
        action={
          <div className="flex gap-2">
            <div className="relative">
              <button 
                onClick={() => setFilterSector(filterSector ? null : sectors[0])}
                className={`inline-flex items-center gap-2 glass text-sm px-4 py-2.5 rounded-xl hover:bg-card/60 transition ${filterSector ? "bg-primary/20 text-primary" : ""}`}
              >
                <Filter className="w-4 h-4" /> {filterSector || "Filter"}
              </button>
              {sectors.length > 1 && !filterSector && (
                <div className="absolute top-full right-0 mt-2 bg-background border border-border/60 rounded-xl shadow-lg overflow-hidden z-20">
                  {sectors.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterSector(s)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-card/60 transition"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilterSector(null)}
                    className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-card/60 border-t"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
            <button onClick={handleExport} className="inline-flex items-center gap-2 glass text-sm px-4 py-2.5 rounded-xl hover:bg-card/60 transition">
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
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(totalInvested)} /></>} 
        />
        <StatCard 
          label="Current value" 
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(totalValue)} /></>} 
          delta={totalPLPercent >= 0 ? `+${totalPLPercent.toFixed(1)}%` : `${totalPLPercent.toFixed(1)}%`} 
          trend={totalPLPercent >= 0 ? "up" : "down"} 
        />
        <StatCard 
          label="Available Cash" 
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(cashBalance)} /></>} 
          delta="ready to invest" 
          trend="up" 
        />
        <StatCard 
          label="Total P/L" 
          value={<><span className="text-muted-foreground text-xl">₹</span><CountUp to={Math.round(totalPL)} /></>} 
          delta={totalPL >= 0 ? "profit" : "loss"} 
          trend={totalPL >= 0 ? "up" : "down"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Allocation donut */}
        <div className="rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="font-semibold mb-1">Sector allocation</div>
          <div className="text-xs text-muted-foreground mb-4">
            Diversification health: <span className={`font-semibold ${sectorData.length >= 4 ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}>
              {sectorData.length >= 5 ? "Strong" : sectorData.length >= 3 ? "Good" : "Building"}
            </span>
          </div>
          <div className="flex items-center justify-center my-4">
            <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90">
              <circle cx="100" cy="100" r={ringR} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="22" />
              {sectorData.map((a) => {
                const len = (C * a.pct) / 100;
                const seg = (
                  <motion.circle
                    key={a.label}
                    cx="100" cy="100" r={ringR} fill="none" stroke={a.color} strokeWidth="22"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-acc}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                  />
                );
                acc += len;
                return seg;
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {sectorData.map((a) => (
              <div key={a.label} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                <span className="flex-1">{a.label}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{a.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance chart */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-card border border-border/60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold">Performance vs NIFTY 50</div>
              <div className="text-xs text-muted-foreground">
                {timeRange === "1W" ? "Last 7 days" : 
                 timeRange === "1M" ? "Last 30 days" : 
                 timeRange === "3M" ? "Last 90 days" : 
                 timeRange === "1Y" ? "Last 365 days" : "All time"}
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
          <PerformanceChart timeRange={timeRange} />
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-2"><span className="w-3 h-0.5 bg-[var(--bull)]" /> Your portfolio</span>
            <span className="inline-flex items-center gap-2"><span className="w-3 h-0.5 bg-muted-foreground" /> NIFTY 50</span>
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="rounded-3xl bg-gradient-card border border-border/60 overflow-hidden">
        <div className="p-6 pb-3 flex items-center justify-between">
          <div className="font-semibold">Holdings <span className="text-muted-foreground font-normal">· {holdings.length}</span></div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Sorted by allocation</span>
        </div>
        <div className="px-2 pb-2 overflow-x-auto">
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
              {holdings.map((h, i) => {
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
                      <div className="font-mono text-xs text-muted-foreground">{h.company_name || h.ticker}</div>
                      <div className="font-medium">{h.ticker}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{h.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹{h.avg_buy_price.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">₹{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 hidden md:table-cell w-[140px]">
                      <Sparkline values={getDeterministicSparkline(h.ticker)} positive={up} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {up ? "+" : ""}₹{Math.abs(Math.round(h.pl)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{up ? "+" : ""}{h.plPercent.toFixed(2)}%</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${allocPercent}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full bg-gradient-primary" />
                        </div>
                        <span className="font-mono text-xs tabular-nums w-8">{allocPercent.toFixed(0)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-card border border-border/60 rounded-3xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add Holding</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-card/60 rounded-xl transition">
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
                      onChange={e => { setSearchQuery(e.target.value); setShowStockDropdown(true); }}
                      onFocus={() => setShowStockDropdown(true)}
                      placeholder="Search Indian stocks..."
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                    {showStockDropdown && filteredStocks.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/60 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                        {filteredStocks.slice(0, 6).map(s => (
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
                        <div className="font-semibold">₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
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
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Price (optional)</label>
                    <input 
                      type="number" 
                      placeholder={`₹${currentPrice.toFixed(2)}`}
                      value={customPrice}
                      onChange={e => setCustomPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full bg-background/50 border border-border/60 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="p-4 bg-card/50 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-semibold">₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Available Cash</span>
                    <span className={totalCost > cashBalance ? "text-[var(--bear)]" : "text-[var(--bull)]"}>
                      ₹{cashBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {totalCost > cashBalance && (
                    <div className="text-xs text-[var(--bear)] mt-2">Insufficient funds</div>
                  )}
                </div>

                <button 
                  onClick={handleBuy}
                  disabled={!selectedStock || effectivePrice <= 0 || totalCost > cashBalance || buying || !marketStatus.open}
                  className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {buying ? "Processing..." : `Buy ${quantity} Share${quantity > 1 ? "s" : ""}`}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedHolding(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-card border border-border/60 rounded-3xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedHolding.ticker}</h2>
                  <p className="text-sm text-muted-foreground">{selectedHolding.company_name || selectedHolding.ticker}</p>
                </div>
                <button onClick={() => setSelectedHolding(null)} className="p-2 hover:bg-card/60 rounded-xl transition">
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
                  <div className="text-2xl font-bold">₹{selectedHolding.avg_buy_price.toLocaleString("en-IN")}</div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="text-2xl font-bold">₹{selectedHolding.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                  <div className="text-2xl font-bold">₹{selectedHolding.currentValue.toLocaleString("en-IN")}</div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">P/L</div>
                  <div className={`text-2xl font-bold ${selectedHolding.pl >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                    {selectedHolding.pl >= 0 ? "+" : ""}₹{Math.abs(Math.round(selectedHolding.pl)).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">P/L %</div>
                  <div className={`text-2xl font-bold ${selectedHolding.plPercent >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                    {selectedHolding.plPercent >= 0 ? "+" : ""}{selectedHolding.plPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Market Status */}
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${marketStatus.open ? "bg-[var(--bull)]/10 border border-[var(--bull)]/30" : "bg-[var(--gold)]/10 border border-[var(--gold)]/30"}`}>
                <Clock className={`w-4 h-4 ${marketStatus.open ? "text-[var(--bull)]" : "text-[var(--gold)]"}`} />
                <span className={`text-sm ${marketStatus.open ? "text-[var(--bull)]" : "text-[var(--gold)]"}`}>
                  {marketStatus.message}
                </span>
              </div>

              {/* Buy/Sell Actions */}
              {!marketStatus.open && (
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Trading disabled until market opens
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setHoldingAction("buy"); setHoldingQuantity(1); }}
                  disabled={!marketStatus.open}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[var(--bull)]/15 text-[var(--bull)] border border-[var(--bull)]/30 hover:bg-[var(--bull)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Buy More
                </button>
                <button 
                  onClick={() => { setHoldingAction("sell"); setHoldingQuantity(1); }}
                  disabled={!marketStatus.open}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[var(--bear)]/15 text-[var(--bear)] border border-[var(--bear)]/30 hover:bg-[var(--bear)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingDown className="w-4 h-4" /> Sell
                </button>
              </div>

              {/* Quick Actions Form */}
              {(holdingAction === "buy" || holdingAction === "sell") && marketStatus.open && (
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
                      <div className="text-xl font-bold">₹{(holdingQuantity * selectedHolding.currentPrice).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { /* TODO: implement buy/sell from holding */ setSelectedHolding(null); }}
                    disabled={performingAction || (holdingAction === "sell" && holdingQuantity > selectedHolding.quantity) || (holdingAction === "buy" && holdingQuantity * selectedHolding.currentPrice > cashBalance)}
                    className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 ${holdingAction === "buy" ? "bg-[var(--bull)] text-[var(--bull)] hover:bg-[var(--bull)]/20" : "bg-[var(--bear)] text-[var(--bear)] hover:bg-[var(--bear)]/20"}`}
                  >
                    {performingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {holdingAction === "buy" ? `Buy ${holdingQuantity} Share${holdingQuantity > 1 ? "s" : ""}` : `Sell ${holdingQuantity} Share${holdingQuantity > 1 ? "s" : ""}`}
                  </button>
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

function PerformanceChart({ timeRange }: { timeRange: TimeRange }) {
  const rangeData: Record<TimeRange, { points: number; label: string[] }> = {
    "1W": { points: 7, label: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    "1M": { points: 15, label: ["Week 1", "Week 2", "Week 3", "Week 4"] },
    "3M": { points: 30, label: ["1M", "2M", "3M"] },
    "1Y": { points: 50, label: ["Q1", "Q2", "Q3", "Q4"] },
    "ALL": { points: 40, label: ["2020", "2021", "2022", "2023", "2024"] },
  };
  
  const config = rangeData[timeRange];
  
  const pts = (seed: number, numPoints: number) => {
    const arr: string[] = [];
    const baseGrowth = timeRange === "1W" ? 2 : timeRange === "1M" ? 5 : timeRange === "3M" ? 12 : timeRange === "1Y" ? 25 : 40;
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 600;
      const baseY = 120 - (i / numPoints) * baseGrowth;
      const wave = Math.sin(i / (numPoints / 6) + seed) * 8 + Math.cos(i / (numPoints / 4) + seed * 2) * 5;
      const y = Math.max(20, baseY + wave + seed * 10);
      arr.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return arr;
  };
  
  const portPts = pts(0, config.points);
  const port = portPts.join(" ");
  
  const niftyPts = pts(0.5, config.points).map((p, i) => {
    const [x, y] = p.split(",").map(Number);
    return `${x.toFixed(1)},${(y + 15 + i * 0.3).toFixed(1)}`;
  });
  const nifty = niftyPts.join(" ");

  const polyPoints = portPts.map(p => p.replace(",", " ")).join(" ");

  const startPort = parseFloat(portPts[0].split(",")[1]);
  const endPort = parseFloat(portPts[portPts.length - 1].split(",")[1]);
  const portChange = ((120 - endPort) - (120 - startPort)).toFixed(1);
  
  const startNifty = parseFloat(niftyPts[0].split(",")[1]);
  const endNifty = parseFloat(niftyPts[niftyPts.length - 1].split(",")[1]);
  const niftyChange = ((135 - endNifty) - (135 - startNifty)).toFixed(1);

  return (
    <svg viewBox="0 0 600 180" className="w-full h-44">
      <defs>
        <linearGradient id="pgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Y-axis labels */}
      <text x="8" y="25" fill="oklch(0.5 0 0 / 0.4)" fontSize="9" fontFamily="monospace">+40%</text>
      <text x="8" y="65" fill="oklch(0.5 0 0 / 0.4)" fontSize="9" fontFamily="monospace">+20%</text>
      <text x="8" y="105" fill="oklch(0.5 0 0 / 0.4)" fontSize="9" fontFamily="monospace">0%</text>
      <text x="8" y="145" fill="oklch(0.5 0 0 / 0.4)" fontSize="9" fontFamily="monospace">-20%</text>
      
      {/* Grid lines */}
      {[0, 1, 2, 3].map((g) => (
        <line key={g} x1="30" x2="600" y1={30 + g * 40} y2={30 + g * 40} stroke="oklch(1 0 0 / 0.05)" />
      ))}
      
      {/* X-axis labels */}
      {config.label.map((label, i) => (
        <text key={i} x={30 + (i * (570 / (config.label.length - 1)))} y="172" fill="oklch(0.5 0 0 / 0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">
          {label}
        </text>
      ))}
      
      {/* Zero line */}
      <line x1="30" x2="600" y1="105" y2="105" stroke="oklch(0.5 0 0 / 0.15)" strokeWidth="1" />
      
      <polygon points={`30,180 ${polyPoints.replace(/(\d+\.\d+),/g, (match, p1) => `${parseFloat(p1) + 30},`)} 630,180`} fill="url(#pgrad)" transform="translate(-30, 0)" />
      
      <motion.polyline 
        points={nifty} 
        fill="none" 
        stroke="oklch(0.5 0 250)" 
        strokeWidth="2" 
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }} 
        animate={{ pathLength: 1 }} 
        transition={{ duration: 1.6 }} 
      />
      <motion.polyline 
        points={port} 
        fill="none" 
        stroke="oklch(0.78 0.18 155)" 
        strokeWidth="2.5" 
        initial={{ pathLength: 0 }} 
        animate={{ pathLength: 1 }} 
        transition={{ duration: 1.8, ease: "easeOut" }} 
      />
      
      {/* End point labels */}
      <circle cx={600} cy={parseFloat(portPts[portPts.length - 1].split(",")[1])} r="4" fill="oklch(0.78 0.18 155)" />
      <text x="588" y={parseFloat(portPts[portPts.length - 1].split(",")[1]) - 8} fill="oklch(0.78 0.18 155)" fontSize="10" fontWeight="bold">+{portChange}%</text>
      
      <circle cx={600} cy={parseFloat(niftyPts[niftyPts.length - 1].split(",")[1])} r="4" fill="oklch(0.5 0 250)" />
      <text x="588" y={parseFloat(niftyPts[niftyPts.length - 1].split(",")[1]) - 8} fill="oklch(0.5 0 250)" fontSize="10" fontWeight="bold">+{niftyChange}%</text>
    </svg>
  );
}
