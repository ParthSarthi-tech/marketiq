import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import floatPortfolio from "@/assets/float-portfolio.png";

export function VirtualPortfolio() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative order-2 lg:order-1"
        >
          <div className="glass rounded-3xl p-8 shadow-elegant relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-bull/30 blur-3xl" />
            <div className="flex items-center justify-between mb-6 relative">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Virtual portfolio</div>
                <div className="font-display text-3xl font-bold mt-1">₹11,28,470</div>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono px-3 py-1.5 rounded-full" style={{ background: 'oklch(0.78 0.18 155 / 0.15)', color: 'var(--bull)' }}>
                <ArrowUpRight className="w-4 h-4" />
                +12.84%
              </div>
            </div>

            {/* Mini chart */}
            <svg viewBox="0 0 400 120" className="w-full h-32 relative">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2 }}
                d="M0,90 L40,80 L80,85 L120,60 L160,65 L200,40 L240,50 L280,30 L320,35 L360,15 L400,20"
                fill="none"
                stroke="oklch(0.78 0.18 155)"
                strokeWidth="2.5"
              />
              <path d="M0,90 L40,80 L80,85 L120,60 L160,65 L200,40 L240,50 L280,30 L320,35 L360,15 L400,20 L400,120 L0,120 Z" fill="url(#g)" />
            </svg>

            <div className="grid grid-cols-3 gap-3 mt-6 relative">
              {[
                { sym: "RELIANCE", v: "+₹3,210" },
                { sym: "INFY", v: "+₹1,084" },
                { sym: "TATAMOTORS", v: "-₹420" },
              ].map((s) => (
                <div key={s.sym} className="bg-background/40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground font-mono">{s.sym}</div>
                  <div className="font-mono font-semibold mt-1" style={{ color: s.v.startsWith('+') ? 'var(--bull)' : 'var(--bear)' }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 glass rounded-2xl p-4 border-l-2 border-accent relative">
              <div className="flex items-center gap-2 text-xs text-accent font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> AI INSIGHT
              </div>
              <p className="text-sm text-foreground/90">
                Your RELIANCE timing was perfect — entered before Q3 results. Consider trimming 20% to lock gains.
              </p>
            </div>
          </div>

          <img src={floatPortfolio} alt="" loading="lazy" width={200} height={200}
            className="absolute -top-10 -right-10 w-32 animate-float opacity-90 hidden md:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-1 lg:order-2"
        >
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-6">
            Risk-free practice
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1]">
            Practice with virtual money. <span className="text-gradient">Learn with AI hindsight.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Start with ₹10,00,000 in virtual cash. Build positions on NSE & BSE, watch them move live. When the dust settles, AI walks you through what you nailed and what you missed — every time.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { v: "₹10L", l: "Starting balance" },
              { v: "Real-time", l: "Market data" },
              { v: "0 risk", l: "Zero real money" },
              { v: "24/7", l: "AI feedback" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4">
                <div className="font-display font-bold text-2xl text-gradient">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
