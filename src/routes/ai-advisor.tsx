import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Brain, Sparkles, ShieldCheck, Activity, Target, Compass,
  TrendingUp, Clock, ArrowRight, MessageSquare, Wand2, Lock, Layers,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { Ticker } from "@/components/landing/Ticker";
import { Footer } from "@/components/landing/CTA";
import { AIAdvisorHero } from "@/components/landing/AIAdvisorHero";

export const Route = createFileRoute("/ai-advisor")({
  component: AIAdvisorPage,
  head: () => ({
    meta: [
      { title: "AI Advisor — MarketIQ | Your second brain for the market" },
      { name: "description", content: "Meet the MarketIQ AI Advisor — a personal stock manager that learns your income, risk and goals, then watches the tape 24/7 so you don't have to." },
      { property: "og:title", content: "MarketIQ AI Advisor — calm, contextual, always-on" },
      { property: "og:description", content: "Risk-aware stock picks, hindsight on every trade, plain-English market explanations. Built for first-time Indian investors." },
    ],
  }),
});

const pipeline = [
  { icon: Compass, title: "Profile", desc: "Income, goals, horizon, risk — all captured in 2 minutes.", accent: "bull" },
  { icon: Layers, title: "Context", desc: "5,000+ stocks, 10y of fundamentals, sector rotation, news.", accent: "gold" },
  { icon: Brain, title: "Reason", desc: "We weight every signal against YOUR life — not someone else's.", accent: "bull" },
  { icon: Wand2, title: "Recommend", desc: "3–5 picks with allocation, reasoning, and a stop-loss plan.", accent: "gold" },
];

const promises = [
  { icon: Lock, title: "No black box", desc: "Every suggestion ships with a 'Why?' button. You learn while you invest." },
  { icon: ShieldCheck, title: "Risk-first, not return-first", desc: "We optimize for the night you sleep well, not the screenshot for X." },
  { icon: Activity, title: "Quiet by default", desc: "It only pings you when something genuinely matters. No noise economy." },
  { icon: Target, title: "Tuned to your goals", desc: "Down-payment in 3y? Retirement in 25? Different brains for different timelines." },
  { icon: TrendingUp, title: "Hindsight on every trade", desc: "Won? It tells you why. Lost? It replays the better move. Forever your coach." },
  { icon: Clock, title: "Time-aware coaching", desc: "Learn when to look, when to ignore, when to act. Your hours are precious." },
];

const chat = [
  { role: "you", text: "I have ₹40k extra this month. Should I deploy it?" },
  { role: "ai", text: "Short answer — partially. Nifty is 4% above its 50-DMA and your IT bucket is already 32% (target 25%)." },
  { role: "ai", text: "Suggested split: ₹15k SUNPHARMA (defensive, +1.6% match), ₹10k DIVISLAB (sector rotation), ₹15k cash for next dip." },
  { role: "you", text: "Why not just buy Reliance again?" },
  { role: "ai", text: "Already 18% of your portfolio. Concentration risk is your #1 silent killer at this stage. Want me to model a 6% drop scenario?" },
];

function AIAdvisorPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <MarketBackdrop />
      <Navbar />

      <AIAdvisorHero />

      <Ticker />

      {/* Brain pipeline */}
      <section id="brain" className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              How it thinks. <span className="text-gradient">In four moves.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Not a magic 8-ball. A transparent pipeline you can interrogate at every step.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pipeline.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative glass rounded-3xl p-7 hover:bg-card/70 transition overflow-hidden"
              >
                <div
                  className="absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-0 group-hover:opacity-30 transition duration-700 blur-3xl"
                  style={{ background: p.accent === "bull" ? "var(--bull)" : "var(--gold)" }}
                />
                <div className="relative flex items-center gap-3 mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: p.accent === "bull"
                        ? "oklch(0.78 0.18 155 / 0.15)"
                        : "oklch(0.85 0.16 90 / 0.15)",
                      color: p.accent === "bull" ? "var(--bull)" : "var(--gold)",
                    }}
                  >
                    <p.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Step 0{i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                {i < pipeline.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversation demo */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-5">
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span className="text-muted-foreground">Ask anything</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-[1.05]">
              Talk to it like a <span className="text-gradient">trusted friend</span> who happens to read 12 hours of charts a day.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              No commands. No filters. Just plain English (or Hindi, Tamil, Telugu — coming soon).
              Every answer ships with the math behind it, ready to challenge.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Why this stock?", "Show worst-case", "Tax impact?", "What did I miss?"].map((q) => (
                <span key={q} className="text-xs px-3 py-1.5 rounded-full glass text-muted-foreground">
                  {q}
                </span>
              ))}
            </div>
          </motion.div>

          <ChatDemo />
        </div>
      </section>

      {/* Promises grid */}
      <section className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              Six promises. <span className="text-gradient">Zero asterisks.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promises.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="glass rounded-2xl p-6 hover:bg-card/70 transition"
              >
                <p.icon className="w-6 h-6 mb-4" style={{ color: "var(--gold)" }} />
                <h3 className="font-display font-bold text-lg mb-1.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex w-16 h-16 rounded-2xl bg-gradient-primary items-center justify-center shadow-glow mb-8"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-4xl md:text-6xl tracking-tighter"
          >
            Ready to meet <span className="text-gradient">your advisor?</span>
          </motion.h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Two minutes to set up. A lifetime of better decisions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/" className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition shadow-glow inline-flex items-center gap-2">
              Start the quiz <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/features" className="glass text-sm font-medium px-7 py-3.5 rounded-full hover:bg-card/70 transition">
              See all features
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ChatDemo() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= chat.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 1500);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative glass rounded-3xl p-6 shadow-elegant overflow-hidden"
      onViewportEnter={() => setCount(1)}
    >
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm">MarketIQ Advisor</div>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse-dot" />
              ONLINE · CONTEXT 92%
            </div>
          </div>
        </div>
        <button onClick={() => setCount(1)} className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition uppercase tracking-widest">
          Replay
        </button>
      </div>

      <div className="space-y-3 min-h-[320px]">
        <AnimatePresence>
          {chat.slice(0, count).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4 }}
              className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "you"
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-card/60 border border-border"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {count < chat.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 ml-2"
          >
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
