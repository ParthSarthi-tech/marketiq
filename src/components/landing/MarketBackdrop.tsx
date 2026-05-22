import { motion, useScroll, useTransform } from "framer-motion";

// Premium, subtle stock-market backdrop pinned behind the entire page.
// Layers: deep grid, animated candlesticks, drifting line chart, glow orbs.
export function MarketBackdrop() {
  const { scrollYProgress } = useScroll();
  const yA = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -240]);

  // pseudo-random but stable candlesticks
  const candles = Array.from({ length: 28 }).map((_, i) => {
    const up = (i * 73) % 5 !== 0;
    const h = 18 + ((i * 37) % 70);
    const wickTop = 6 + ((i * 19) % 14);
    const wickBot = 6 + ((i * 23) % 14);
    return { up, h, wickTop, wickBot, delay: (i % 12) * 0.25 };
  });

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base wash */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute inset-0 bg-gradient-hero opacity-80" />

      {/* fine grid */}
      <div className="absolute inset-0 grid-bg opacity-[0.18]" />

      {/* radial top glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-gradient-radial opacity-60 blur-2xl" />

      {/* drifting orbs */}
      <motion.div
        style={{ y: yA }}
        className="absolute top-[20%] -left-40 w-[520px] h-[520px] rounded-full blur-[120px] opacity-[0.18]"
      >
        <div className="w-full h-full rounded-full" style={{ background: "var(--bull)" }} />
      </motion.div>
      <motion.div
        style={{ y: yB }}
        className="absolute top-[55%] -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.14]"
      >
        <div className="w-full h-full rounded-full" style={{ background: "var(--gold)" }} />
      </motion.div>
      <motion.div
        style={{ y: yC }}
        className="absolute top-[110%] left-[20%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-[0.12]"
      >
        <div className="w-full h-full rounded-full" style={{ background: "var(--primary)" }} />
      </motion.div>

      {/* Candlestick row — bottom band */}
      <motion.svg
        style={{ y: yA }}
        viewBox="0 0 1400 220"
        preserveAspectRatio="none"
        className="absolute bottom-[8%] left-0 w-[140%] -translate-x-[10%] h-[220px] opacity-[0.18]"
      >
        {candles.map((c, i) => {
          const x = i * 50 + 10;
          const cy = 110;
          return (
            <g key={i}>
              <line
                x1={x + 8} x2={x + 8}
                y1={cy - c.h / 2 - c.wickTop} y2={cy + c.h / 2 + c.wickBot}
                stroke={c.up ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.24 25)"}
                strokeWidth="1"
                opacity="0.7"
              />
              <motion.rect
                x={x}
                width="16"
                rx="2"
                initial={{ height: 4, y: cy - 2 }}
                animate={{ height: c.h, y: cy - c.h / 2 }}
                transition={{ duration: 1.6, delay: c.delay, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 + (i % 4) }}
                fill={c.up ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.24 25)"}
                opacity="0.85"
              />
            </g>
          );
        })}
      </motion.svg>

      {/* Drifting line chart — middle band */}
      <motion.svg
        style={{ y: yB }}
        viewBox="0 0 1600 400"
        preserveAspectRatio="none"
        className="absolute top-[35%] left-0 w-[140%] -translate-x-[10%] h-[400px] opacity-[0.12]"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.78 0.18 155)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.85 0.16 90)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M0,300 Q100,280 200,220 T400,200 T600,280 T800,150 T1000,200 T1200,260 T1400,180 T1600,140`}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        />
        <path
          d={`M0,300 Q100,280 200,220 T400,200 T600,280 T800,150 T1000,200 T1200,260 T1400,180 T1600,140 L1600,400 L0,400 Z`}
          fill="url(#areaGrad)"
        />
      </motion.svg>

      {/* Faint ticker letters as watermark */}
      <div className="absolute inset-0 flex flex-col justify-between py-32 px-12 font-mono text-[10px] tracking-[0.4em] uppercase text-foreground/[0.04] select-none">
        <div className="text-right">NSE · NIFTY 50 · SENSEX · BSE · BANKNIFTY</div>
        <div>RELIANCE ▲ · TCS ▼ · HDFCBANK ▲ · INFY ▲ · ITC ▼ · SBIN ▲</div>
      </div>

      {/* vignette to keep text legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.14_0.03_250/0.7)_100%)]" />
    </div>
  );
}
