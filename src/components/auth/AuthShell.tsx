import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { TrendingUp, ShieldCheck, Sparkles, LineChart } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  side: "in" | "up";
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const proofs = [
  { icon: ShieldCheck, label: "SEBI-aware guidance", tone: "bull" },
  { icon: LineChart, label: "Live NSE / BSE pulse", tone: "gold" },
  { icon: Sparkles, label: "AI tuned to your goals", tone: "primary" },
];

export function AuthShell({ side, eyebrow, title, subtitle, children, footer }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-[0.15]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-gradient-radial blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -28, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -left-40 w-[480px] h-[480px] rounded-full blur-[120px] opacity-[0.22]"
          style={{ background: "var(--bull)" }}
        />
        <motion.div
          animate={{ y: [0, 32, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] -right-40 w-[560px] h-[560px] rounded-full blur-[140px] opacity-[0.18]"
          style={{ background: "var(--gold)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.14_0.03_250/0.85)_100%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 min-h-screen grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
        {/* Left brand panel */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col gap-10 relative"
        >
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              Market<span className="text-gradient">IQ</span>
            </span>
          </Link>

          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse-dot" />
              {side === "in" ? "Welcome back" : "New investor"}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="font-display font-bold text-5xl xl:text-6xl tracking-tighter leading-[1.02]"
            >
              {side === "in" ? (
                <>
                  Pick up <span className="text-gradient">where the market</span> left off.
                </>
              ) : (
                <>
                  Your first smart trade <span className="text-gradient">starts here.</span>
                </>
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              {side === "in"
                ? "Your portfolio, AI advisor and learning path — already warmed up and waiting."
                : "Two minutes to set up. A lifetime of clarity, confidence and compounding."}
            </motion.p>
          </div>

          {/* Proof cards */}
          <div className="space-y-3 max-w-md">
            {proofs.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                className="glass rounded-2xl px-4 py-3 flex items-center gap-3 group hover:translate-x-1 transition"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      p.tone === "bull"
                        ? "color-mix(in oklab, var(--bull) 18%, transparent)"
                        : p.tone === "gold"
                          ? "color-mix(in oklab, var(--gold) 18%, transparent)"
                          : "color-mix(in oklab, var(--primary) 18%, transparent)",
                  }}
                >
                  <p.icon className="w-4 h-4" style={{ color: `var(--${p.tone === "primary" ? "primary" : p.tone})` }} />
                </div>
                <div className="text-sm font-medium">{p.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Live mini ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="glass rounded-2xl p-5 max-w-md"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span className="font-mono uppercase tracking-wider">Live · NIFTY 50</span>
              <span className="text-bull font-semibold">+0.42%</span>
            </div>
            <svg viewBox="0 0 300 60" className="w-full h-12" preserveAspectRatio="none">
              <defs>
                <linearGradient id="authLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
                  <stop offset="50%" stopColor="oklch(0.78 0.18 155)" />
                  <stop offset="100%" stopColor="oklch(0.85 0.16 90)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={`M0,40 Q30,35 60,42 T120,30 T180,28 T240,35 T300,22`}
                fill="none"
                stroke="url(#authLine)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              />
            </svg>
          </motion.div>
        </motion.aside>

        {/* Right form card */}
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md mx-auto"
        >
          {/* Mobile brand */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Market<span className="text-gradient">IQ</span>
            </span>
          </Link>

          <div className="relative glass rounded-3xl p-8 md:p-10 shadow-elegant overflow-hidden">
            {/* animated border sheen */}
            <motion.div
              aria-hidden
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear", repeatDelay: 1.6 }}
              className="absolute -top-px left-0 h-px w-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.85 0.16 90 / 0.9), transparent)",
              }}
            />
            <div className="absolute -top-32 -right-24 w-64 h-64 rounded-full bg-gradient-primary opacity-[0.12] blur-3xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-3"
            >
              {eyebrow}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display font-bold text-3xl md:text-4xl tracking-tight leading-[1.05]"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-3 text-muted-foreground text-sm"
            >
              {subtitle}
            </motion.p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by 256-bit encryption · Not investment advice
          </p>
        </motion.section>
      </div>
    </main>
  );
}
