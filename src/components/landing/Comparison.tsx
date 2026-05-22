import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, Sparkles, AlertTriangle, Brain, ShieldCheck, X, Check } from "lucide-react";

const scenarios = [
  {
    id: 0,
    label: "You buy RELIANCE at ₹2,845",
    old: {
      title: "Your old broker",
      icon: AlertTriangle,
      msg: "Order placed. ✓",
      sub: "No context. No risk check. Good luck.",
      tone: "bear",
    },
    iq: {
      title: "MarketIQ",
      icon: Brain,
      msg: "Heads up — RELIANCE is at a 52-week high.",
      sub: "Your risk profile says 'medium'. Suggest 40% allocation, not 100%.",
      tone: "bull",
    },
  },
  {
    id: 1,
    label: "Stock drops 6% next week",
    old: {
      title: "Your old broker",
      icon: TrendingDown,
      msg: "−₹8,420 in red.",
      sub: "Now what? You're on your own.",
      tone: "bear",
    },
    iq: {
      title: "MarketIQ",
      icon: Sparkles,
      msg: "Sector-wide pullback. Fundamentals intact.",
      sub: "Hold + average down at ₹2,680. Hindsight: this happens 4× a year.",
      tone: "bull",
    },
  },
  {
    id: 2,
    label: "You're new. You don't know where to start.",
    old: {
      title: "Your old broker",
      icon: X,
      msg: "Here's 5,000 stocks. Pick one.",
      sub: "Same dashboard a hedge fund manager uses.",
      tone: "bear",
    },
    iq: {
      title: "MarketIQ",
      icon: ShieldCheck,
      msg: "Tell us your income, goal & risk.",
      sub: "We'll match 3 stocks today. Practice with ₹10L virtual money first.",
      tone: "bull",
    },
  },
];

export function Comparison() {
  const [active, setActive] = useState(0);

  // Auto-cycle
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % scenarios.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = scenarios[active];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
            Live side-by-side
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
            Same moment. <span className="text-gradient">Two very different apps.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pick a scenario — feel what changes when your app actually thinks with you.
          </p>
        </motion.div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {scenarios.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => setActive(i)}
              className={`relative text-sm px-4 py-2.5 rounded-full transition border ${
                active === i
                  ? "text-foreground border-transparent"
                  : "text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="scenario-pill"
                  className="absolute inset-0 rounded-full bg-gradient-primary shadow-glow -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={active === i ? "text-primary-foreground font-semibold" : ""}>
                {sc.label}
              </span>
            </button>
          ))}
        </div>

        {/* The two phones */}
        <div className="grid md:grid-cols-2 gap-6 relative">
          {/* VS divider */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <motion.div
              key={active}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="w-14 h-14 rounded-full glass flex items-center justify-center font-display font-bold text-sm shadow-elegant"
            >
              VS
            </motion.div>
          </div>

          <PhoneCard variant="old" scenario={s} />
          <PhoneCard variant="iq" scenario={s} />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-10">
          {scenarios.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Scenario ${i + 1}`}
              className="h-1.5 rounded-full overflow-hidden bg-border"
              style={{ width: active === i ? 40 : 16 }}
            >
              {active === i && (
                <motion.div
                  key={active}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhoneCard({
  variant,
  scenario,
}: {
  variant: "old" | "iq";
  scenario: (typeof scenarios)[number];
}) {
  const data = variant === "old" ? scenario.old : scenario.iq;
  const isIQ = variant === "iq";
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: isIQ ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`relative glass rounded-3xl p-7 overflow-hidden ${
        isIQ ? "ring-1 ring-primary/30" : "opacity-90"
      }`}
    >
      {/* Ambient glow */}
      <div
        className={`absolute -top-32 ${isIQ ? "-right-32" : "-left-32"} w-72 h-72 rounded-full blur-3xl opacity-30 transition`}
        style={{ background: isIQ ? "var(--bull)" : "var(--bear)" }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: isIQ ? "var(--bull)" : "var(--bear)" }} />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{data.title}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">9:41 AM</span>
      </div>

      {/* Mini chart */}
      <div className="relative h-20 mb-5 rounded-xl bg-card/40 border border-border/50 overflow-hidden">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <motion.path
            key={`${variant}-${scenario.id}`}
            d={isIQ
              ? "M0,55 L30,48 L60,52 L90,38 L120,42 L150,28 L180,32 L200,18"
              : "M0,30 L30,40 L60,35 L90,55 L120,48 L150,62 L180,58 L200,70"}
            fill="none"
            stroke={isIQ ? "var(--bull)" : "var(--bear)"}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* Candles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const up = isIQ ? i % 3 !== 0 : i % 3 === 0;
            const h = 6 + ((i * 7) % 14);
            return (
              <motion.rect
                key={`${variant}-${scenario.id}-c-${i}`}
                x={4 + i * 16}
                y={40 - h / 2}
                width="3"
                height={h}
                fill={up ? "var(--bull)" : "var(--bear)"}
                opacity="0.35"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{ transformOrigin: "center" }}
              />
            );
          })}
        </svg>
      </div>

      {/* Notification */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${variant}-${scenario.id}`}
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl p-5 border"
          style={{
            background: isIQ ? "oklch(0.78 0.18 155 / 0.08)" : "oklch(0.65 0.24 25 / 0.06)",
            borderColor: isIQ ? "oklch(0.78 0.18 155 / 0.3)" : "oklch(0.65 0.24 25 / 0.25)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isIQ ? "oklch(0.78 0.18 155 / 0.18)" : "oklch(0.65 0.24 25 / 0.15)",
                color: isIQ ? "var(--bull)" : "var(--bear)",
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-[15px] leading-snug mb-1">{data.msg}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{data.sub}</div>
            </div>
          </div>

          {/* IQ-only typing indicator + actions */}
          {isIQ && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center gap-2"
            >
              <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                Apply suggestion
              </button>
              <button className="text-xs font-medium px-3 py-1.5 rounded-full glass text-muted-foreground hover:text-foreground transition">
                Why?
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer outcome */}
      <div className="relative mt-5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Outcome</span>
        <span
          className="font-mono font-semibold inline-flex items-center gap-1"
          style={{ color: isIQ ? "var(--bull)" : "var(--bear)" }}
        >
          {isIQ ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          {isIQ ? "Informed decision" : "Blind move"}
          {isIQ ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        </span>
      </div>
    </motion.div>
  );
}
