import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  BookOpen, Award, Clock, Sparkles, ArrowRight, CheckCircle2,
  TrendingUp, BarChart3, ShieldCheck, Wallet, Coins, Brain,
  PlayCircle, Lock,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { Ticker } from "@/components/landing/Ticker";
import { Footer } from "@/components/landing/CTA";
import { LearnHero } from "@/components/landing/LearnHero";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  head: () => ({
    meta: [
      { title: "Learn — MarketIQ | 15 minutes a day to investor confidence" },
      { name: "description", content: "Bite-sized, jargon-free lessons that turn the Indian stock market into a calm daily ritual. From P/E ratios to options, every concept under 3 minutes." },
      { property: "og:title", content: "MarketIQ Learn — wake up confident about money" },
      { property: "og:description", content: "120+ lessons, 12 milestones, daily 15-min path. Learn while you invest, with hindsight from real trades." },
    ],
  }),
});

const path = [
  { lvl: "Foundations", icon: Coins,        desc: "Money, markets, mindset.",                lessons: 18, mins: 45, locked: false },
  { lvl: "Stocks 101",  icon: BarChart3,    desc: "What you're actually buying.",            lessons: 22, mins: 60, locked: false },
  { lvl: "Reading the tape", icon: TrendingUp, desc: "Charts, candles, signals — demystified.", lessons: 26, mins: 80, locked: false },
  { lvl: "Risk first",  icon: ShieldCheck,  desc: "Position sizing, stop losses, sleep.",    lessons: 14, mins: 35, locked: true  },
  { lvl: "Portfolio craft", icon: Wallet,   desc: "Diversification that actually diversifies.", lessons: 16, mins: 50, locked: true  },
  { lvl: "Advanced plays", icon: Brain,     desc: "Options, F&O, sector rotation.",          lessons: 24, mins: 90, locked: true  },
];

const lesson = {
  title: "What is a P/E ratio, really?",
  duration: "2 min · Foundations · Lesson 04",
  hook: "₹100 today buys you a slice of future profits. The P/E tells you how many years of those profits you're paying for upfront.",
  steps: [
    "Imagine a chai stall earning ₹10,000/year. Selling for ₹2,00,000.",
    "P/E = 2,00,000 ÷ 10,000 = 20. You're paying for 20 years of chai profits.",
    "TCS trades at ~28 P/E. Reliance at ~24. Why? Growth & confidence — not just maths.",
    "Rule of thumb: high P/E = market expects acceleration. Low P/E = caution or bargain.",
  ],
};

const milestones = [
  { name: "First investment", desc: "Open a virtual portfolio.", done: true },
  { name: "First defensive trade", desc: "Place a stop-loss before profit.", done: true },
  { name: "First sector pivot", desc: "Rebalance based on rotation insight.", done: false },
  { name: "First hindsight win", desc: "Apply a counterfactual & beat your past self.", done: false },
];

const tips = [
  { icon: Clock, title: "15 minutes a day", desc: "We surface only what changed and what matters." },
  { icon: BookOpen, title: "3-minute lessons", desc: "Every concept fits in a chai break." },
  { icon: Award, title: "Confidence badges", desc: "Track your growth. Every milestone celebrated." },
];

function LearnPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <MarketBackdrop />
      <Navbar />

      <LearnHero />

      <Ticker />

      {/* The path */}
      <section id="path" className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              Six levels. <span className="text-gradient">One investor.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Each level unlocks as you finish the last. No grinding. No gatekeeping — just rhythm.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />

            <div className="space-y-6">
              {path.map((p, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={p.lvl}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className={`relative md:w-1/2 ${isLeft ? "md:pr-12" : "md:ml-auto md:pl-12"}`}
                  >
                    {/* Node on the line */}
                    <div className={`hidden md:flex absolute top-7 ${isLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"} w-4 h-4 rounded-full items-center justify-center`}
                      style={{
                        background: p.locked ? "var(--card)" : "var(--bull)",
                        boxShadow: p.locked ? "none" : "0 0 0 4px oklch(0.78 0.18 155 / 0.18)",
                      }}
                    />
                    <div className="group glass rounded-3xl p-7 hover:bg-card/70 transition">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                          style={{
                            background: p.locked
                              ? "oklch(0.3 0.02 250 / 0.4)"
                              : "oklch(0.78 0.18 155 / 0.15)",
                            color: p.locked ? "var(--muted-foreground)" : "var(--bull)",
                          }}
                        >
                          {p.locked ? <Lock className="w-5 h-5" /> : <p.icon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              Level 0{i + 1}
                            </span>
                            {p.locked && (
                              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">· locked</span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-xl">{p.lvl}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-mono">{p.lessons} lessons</span>
                            <span>·</span>
                            <span className="font-mono">~{p.mins} min total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lesson preview */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-5">
              <PlayCircle className="w-3.5 h-3.5 text-accent" />
              <span className="text-muted-foreground">Try a lesson</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-[1.05]">
              Concepts that <span className="text-gradient">finally click.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              No 30-page PDFs. No "watch this 1-hour video." Just one idea, one
              analogy, four steps — and you're moving on with a sharper instinct.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Indian-context examples (chai stalls, monsoons, festive demand)",
                "Hindi finance terms gently introduced",
                "Tap any term → AI defines it inline",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--bull)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          <LessonCard />
        </div>
      </section>

      {/* Milestones */}
      <section className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              Confidence, <span className="text-gradient">stamped.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              12 milestones across your journey. Each one a story you'll tell
              yourself when the market gets loud.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {milestones.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative glass rounded-2xl p-6 overflow-hidden ${m.done ? "ring-1 ring-primary/40" : ""}`}
              >
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30"
                  style={{ background: m.done ? "var(--bull)" : "var(--muted)" }}
                />
                <div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: m.done ? "var(--gradient-primary)" : "oklch(0.3 0.02 250 / 0.4)",
                    boxShadow: m.done ? "var(--shadow-glow)" : "none",
                  }}
                >
                  <Award className="w-6 h-6" style={{ color: m.done ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                </div>
                <h3 className="font-display font-bold text-base mb-1">{m.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                <div className="mt-4 text-[10px] font-mono uppercase tracking-widest" style={{ color: m.done ? "var(--bull)" : "var(--muted-foreground)" }}>
                  {m.done ? "✓ Earned" : "Locked"}
                </div>
              </motion.div>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`g-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + milestones.length) * 0.04 }}
                className="glass rounded-2xl p-6 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground"
              >
                <Lock className="w-5 h-5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips strip */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-5">
          {tips.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-7 text-center hover:bg-card/60 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
                <t.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
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
            15 minutes. <span className="text-gradient">Today.</span>
          </motion.h2>
          <p className="mt-5 text-muted-foreground text-lg">
            That's all it takes to start. Your future self is already grateful.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/" className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition shadow-glow inline-flex items-center gap-2">
              Begin Lesson 01 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/ai-advisor" className="glass text-sm font-medium px-7 py-3.5 rounded-full hover:bg-card/70 transition">
              Meet the AI advisor
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function LessonCard() {
  const [step, setStep] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative glass rounded-3xl p-7 shadow-elegant overflow-hidden"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {lesson.duration}
          </div>
          <h3 className="font-display font-bold text-2xl tracking-tight">{lesson.title}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      <div className="rounded-2xl bg-card/40 border border-border/60 p-5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">The hook</div>
        <p className="text-sm leading-relaxed text-foreground/90">{lesson.hook}</p>
      </div>

      <div className="space-y-2 mb-6">
        {lesson.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className="w-full text-left"
          >
            <motion.div
              animate={{
                opacity: step >= i ? 1 : 0.4,
                x: step === i ? 4 : 0,
              }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                step === i ? "bg-card/70 border-primary/40" : "border-transparent hover:bg-card/30"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                  step >= i ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${i}-${step >= i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-relaxed"
                >
                  {s}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="h-1 rounded-full bg-secondary overflow-hidden mb-4">
        <motion.div
          animate={{ width: `${((step + 1) / lesson.steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-primary"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          Step {step + 1} of {lesson.steps.length}
        </span>
        <button
          onClick={() => setStep((s) => (s + 1) % lesson.steps.length)}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground shadow-glow inline-flex items-center gap-1.5"
        >
          {step === lesson.steps.length - 1 ? "Restart" : "Next"} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
