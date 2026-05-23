import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, BookOpen, Award, Lock, CheckCircle2, Flame, Construction, Clock, Bell } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";

export const Route = createFileRoute("/app/learn")({
  component: Learn,
  head: () => ({ meta: [{ title: "Learn — MarketIQ" }, { name: "description", content: "Bite-sized lessons to make Indian markets click." }] }),
});

const tracks = [
  {
    title: "Investor 101",
    sub: "Foundations for first-timers",
    progress: 60,
    color: "var(--bull)",
    lessons: [
      { name: "What is a stock?", time: "3 min", state: "done" },
      { name: "How NSE & BSE work", time: "4 min", state: "done" },
      { name: "Reading the P/E ratio", time: "5 min", state: "active" },
      { name: "Demat & trading accounts", time: "4 min", state: "locked" },
      { name: "Your first ₹500 investment", time: "6 min", state: "locked" },
    ],
  },
  {
    title: "Reading the chart",
    sub: "Technicals without the jargon",
    progress: 25,
    color: "var(--gold)",
    lessons: [
      { name: "Candlesticks decoded", time: "5 min", state: "done" },
      { name: "Support & resistance", time: "6 min", state: "active" },
      { name: "Moving averages", time: "7 min", state: "locked" },
      { name: "Volume tells stories", time: "5 min", state: "locked" },
    ],
  },
  {
    title: "Building a portfolio",
    sub: "Diversification, SIPs, rebalancing",
    progress: 0,
    color: "oklch(0.72 0.22 320)",
    lessons: [
      { name: "Sector diversification", time: "6 min", state: "active" },
      { name: "Equity vs MF vs ETF", time: "8 min", state: "locked" },
      { name: "The SIP playbook", time: "7 min", state: "locked" },
    ],
  },
];

function Learn() {
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        <PageHeader
          eyebrow="Learning hub"
          title={<>Get <span className="text-gradient">market-fluent</span> in minutes a day.</>}
          subtitle="12 lessons, 3 tracks, zero jargon. Earn badges and unlock advanced strategies."
          action={
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm">
              <Flame className="w-4 h-4 text-accent" />
              <span className="font-semibold">12-day streak</span>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "Lessons done", val: "8 / 24" },
            { icon: Award, label: "Badges earned", val: "3" },
            { icon: Flame, label: "Daily streak", val: "12" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-5 bg-gradient-card border border-border/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{s.label}</div>
                  <div className="font-display text-2xl font-semibold tabular-nums">{s.val}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {tracks.map((t, ti) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ti * 0.1, duration: 0.5 }}
              className="rounded-3xl p-6 bg-gradient-card border border-border/60"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display text-xl font-semibold">{t.title}</div>
                  <div className="text-sm text-muted-foreground">{t.sub}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t.progress}% complete</div>
                  <div className="mt-1 w-32 h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${t.progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full" style={{ background: t.color }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {t.lessons.map((l, i) => {
                  const done = l.state === "done";
                  const locked = l.state === "locked";
                  const active = l.state === "active";
                  return (
                    <motion.div
                      key={l.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + ti * 0.1 + 0.2 }}
                      className={`group flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                        active ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border/40 bg-card/30 hover:border-primary/30"
                      } ${locked ? "opacity-50" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        done ? "bg-[var(--bull)]/20 text-[var(--bull)]" : locked ? "bg-card text-muted-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow"
                      }`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : locked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{l.name}</div>
                        <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{l.time}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Under Development Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        style={{ top: "25%" }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="relative text-center max-w-lg mx-auto p-10"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-background/80 backdrop-blur-2xl border border-border/60 shadow-2xl -z-10" />
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-primary/10 blur-3xl -z-20" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <Construction className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display font-bold text-3xl md:text-4xl tracking-tighter mb-3"
          >
            Learning Hub <span className="text-gradient">Coming Soon</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground leading-relaxed mb-8"
          >
            We're building bite-sized lessons, interactive quizzes, and progress tracking to make Indian markets click — one 3-minute session at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3 items-center"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>Expected launch: <span className="text-foreground font-semibold">Q3 2026</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="w-4 h-4 text-accent" />
              <span>We'll notify you when it's ready</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 h-1.5 max-w-xs mx-auto rounded-full bg-border overflow-hidden"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "65%" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-primary"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2"
          >
            65% complete
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
