import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, Target, Clock, TrendingUp, Check, ArrowRight } from "lucide-react";
import floatAi from "@/assets/float-ai.png";

const steps = [
  { icon: Target, title: "Income & goals", desc: "Tell us your monthly income and what you're investing for." },
  { icon: TrendingUp, title: "Risk appetite", desc: "Conservative, balanced or aggressive — we calibrate." },
  { icon: Clock, title: "Time horizon", desc: "Short-term play or long-term wealth? You decide." },
  { icon: Brain, title: "AI picks for you", desc: "We surface stocks that match — not generic, not noisy." },
];

export function AISection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const yImg = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".ai-bg-grid", {
        opacity: 0.5,
        ease: "none",
        scrollTrigger: { trigger: ".ai-section", start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
      gsap.fromTo(".ai-left",
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, ease: "none",
          scrollTrigger: { trigger: ".ai-section", start: "top 75%", end: "center 40%", scrub: 1 },
        },
      );
      gsap.fromTo(".ai-card",
        { opacity: 0, x: 40, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, ease: "none",
          scrollTrigger: { trigger: ".ai-section", start: "top 75%", end: "center 40%", scrub: 1 },
        },
      );
      gsap.to(".ai-float", {
        y: -80,
        ease: "none",
        scrollTrigger: { trigger: ".ai-section", start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="ai" ref={ref} className="ai-section relative py-32 overflow-hidden">
      <div className="ai-bg-grid absolute inset-0 grid-bg opacity-30 -z-10" />
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="ai-left"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-6">
            <Brain className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">What sets us apart</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1]">
            An AI stock manager <span className="text-gradient">tuned to you</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Take a 2-minute quiz. We learn your income, risk tolerance, goals and the time you want to spend. Then our AI hand-picks stocks built around <em className="text-foreground not-italic">your</em> life — not someone else's.
          </p>

          <div className="mt-10 space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="flex items-start gap-4 glass rounded-2xl p-4 hover:bg-card/60 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link to="/app/onboarding" className="mt-10 bg-gradient-primary text-primary-foreground font-semibold px-7 py-4 rounded-full shadow-glow hover:scale-105 transition inline-flex items-center gap-2">
            Take the 2-min quiz <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="ai-card"><InteractiveMatchCard yImg={yImg} rotate={rotate} /></div>
      </div>
    </section>
  );
}

const inputs = [
  { label: "Monthly income", value: "₹85,000", pct: 64 },
  { label: "Risk appetite", value: "Balanced", pct: 55 },
  { label: "Time horizon", value: "5+ years", pct: 80 },
  { label: "Sectors of interest", value: "IT · Energy · Pharma", pct: 72 },
];

const matches = [
  { sym: "RELIANCE",  name: "Reliance Industries", chg: "+2.4%", score: 96, sector: "Energy" },
  { sym: "TCS",       name: "Tata Consultancy",    chg: "+1.8%", score: 92, sector: "IT" },
  { sym: "SUNPHARMA", name: "Sun Pharmaceutical",  chg: "+1.6%", score: 88, sector: "Pharma" },
];

function InteractiveMatchCard({ yImg, rotate }: { yImg: any; rotate: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.2"] });
  const reveal = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative max-w-lg mx-auto w-full"
    >
      {/* Glow ring background */}
      <motion.div
        style={{ rotate }}
        className="absolute -inset-8 rounded-[3rem] border border-primary/15 pointer-events-none"
      />
      <motion.div
        style={{ rotate: useTransform(rotate, (v: number) => -v) }}
        className="absolute -inset-2 rounded-[2.5rem] border border-accent/15 border-dashed pointer-events-none"
      />
      <motion.img
        style={{ y: yImg }}
        src={floatAi} alt=""
        loading="lazy" width={120} height={120}
        className="ai-float absolute -top-10 -right-6 w-24 animate-float drop-shadow-[0_0_40px_oklch(0.85_0.16_90_/_0.6)] pointer-events-none"
      />

      <div className="glass rounded-3xl p-6 shadow-elegant relative overflow-hidden">
        {/* Scanline */}
        <motion.div
          initial={{ y: "-100%" }}
          whileInView={{ y: "120%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/15 to-transparent pointer-events-none"
        />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse-dot" />
            <span className="text-xs font-mono text-muted-foreground">AI MATCH ENGINE · LIVE</span>
          </div>
          <Brain className="w-4 h-4 text-accent" />
        </div>

        {/* Inputs being analyzed */}
        <div className="space-y-3 mb-6">
          {inputs.map((i, idx) => (
            <motion.div
              key={i.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.12 }}
            >
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{i.label}</span>
                <span className="font-mono font-semibold">{i.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${i.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + idx * 0.12, ease: "easeOut" }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reveal divider */}
        <div className="relative my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent">Matched for you</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Matched stocks reveal */}
        <div className="space-y-2.5">
          {matches.map((m, idx) => (
            <motion.div
              key={m.sym}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 1 + idx * 0.18, duration: 0.6 }}
              whileHover={{ scale: 1.03, x: 6 }}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border hover:border-primary/40 hover:bg-card/70 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <span className="font-mono font-bold text-xs text-primary-foreground">{m.sym.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{m.sym}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{m.sector}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-sm font-semibold" style={{ color: "var(--bull)" }}>{m.chg}</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Check className="w-2.5 h-2.5 text-bull" />
                  <span className="font-mono">{m.score}% match</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ scaleX: reveal }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary origin-left"
        />
      </div>
    </motion.div>
  );
}
