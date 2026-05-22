const stocks = [
  { sym: "RELIANCE", price: "2,845.10", chg: "+1.12%", up: true },
  { sym: "TCS", price: "3,982.45", chg: "-0.67%", up: false },
  { sym: "HDFCBANK", price: "1,672.30", chg: "+0.84%", up: true },
  { sym: "INFY", price: "1,548.75", chg: "+1.43%", up: true },
  { sym: "ICICIBANK", price: "1,209.55", chg: "+0.62%", up: true },
  { sym: "TATAMOTORS", price: "987.20", chg: "+2.18%", up: true },
  { sym: "SBIN", price: "812.40", chg: "-0.41%", up: false },
  { sym: "BHARTIARTL", price: "1,498.65", chg: "+1.05%", up: true },
  { sym: "ADANIENT", price: "3,124.90", chg: "-1.27%", up: false },
  { sym: "SUNPHARMA", price: "1,742.85", chg: "+0.93%", up: true },
  { sym: "WIPRO", price: "542.10", chg: "+0.36%", up: true },
  { sym: "MARUTI", price: "12,480.50", chg: "+1.62%", up: true },
];

export function Ticker() {
  const items = [...stocks, ...stocks];
  return (
    <div className="relative border-y border-border/50 bg-card/30 backdrop-blur py-4 ticker-mask overflow-hidden">
      <div className="flex animate-ticker gap-10 whitespace-nowrap">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm">
            <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: s.up ? 'var(--bull)' : 'var(--bear)' }} />
            <span className="font-bold text-foreground">{s.sym}</span>
            <span className="text-muted-foreground">₹{s.price}</span>
            <span style={{ color: s.up ? 'var(--bull)' : 'var(--bear)' }} className="font-semibold">{s.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
