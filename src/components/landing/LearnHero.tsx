import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";

const WORDS = ["confident", "curious", "calm", "fearless", "fluent"];

export function LearnHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative pt-36 pb-24 overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-24 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 155 / 0.30), transparent 60%)" }}
        />
      </motion.div>

      {/* Floating pages / cards */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {[
          { x: "12%", y: "28%", r: -8, d: 0 },
          { x: "82%", y: "32%", r: 6, d: 0.4 },
          { x: "18%", y: "70%", r: 4, d: 0.8 },
          { x: "78%", y: "72%", r: -6, d: 1.2 },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, rotate: p.r }}
            animate={{ opacity: [0, 0.55, 0.55, 0], y: [30, -10, -10, -40] }}
            transition={{ duration: 7, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-28 h-36 rounded-xl glass border border-border/60"
            style={{ left: p.x, top: p.y, transform: `rotate(${p.r}deg)` }}
          >
            <div className="p-3 space-y-2">
              <div className="h-1.5 rounded-full bg-foreground/30 w-3/4" />
              <div className="h-1.5 rounded-full bg-foreground/15 w-full" />
              <div className="h-1.5 rounded-full bg-foreground/15 w-5/6" />
              <div className="mt-3 h-12 rounded-md bg-gradient-primary/40" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-32 left-0 right-0 h-px origin-left"
        style={{ background: "linear-gradient(90deg, transparent, var(--bull), transparent)" }}
      />

      <motion.div style={{ y }} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <GraduationCap className="w-3.5 h-3.5" style={{ color: "var(--bull)" }} />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            LEARN · DAILY 15-MIN PATH · v1.4
          </span>
        </motion.div>

        <h1 className="font-display font-bold text-center text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.02]">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="block"
            >
              Wake up
            </motion.span>
          </span>
          <span className="block overflow-hidden h-[1.1em] relative">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center"
            >
              <RotatingWord />
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="block"
            >
              about money.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 text-center text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Bite-sized lessons that turn the chaos of the market into a calm
          ritual. 15 minutes a day. No jargon. Real rupees behind every concept.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mt-12 grid grid-cols-3 max-w-2xl mx-auto gap-px rounded-2xl glass overflow-hidden"
        >
          {[
            { k: "120+", v: "lessons" },
            { k: "15 min", v: "daily ritual" },
            { k: "12", v: "milestones" },
          ].map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.12 }}
              className="px-4 py-5 text-center bg-card/40"
            >
              <div className="font-display font-bold text-2xl text-foreground">{s.k}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Link to="/app/learn" className="group relative bg-gradient-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-full transition shadow-glow inline-flex items-center gap-2 overflow-hidden">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            Start Lesson 01 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
          <a href="#path" className="glass text-sm font-medium px-6 py-3 rounded-full hover:bg-card/70 transition">
            See the path ↓
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function RotatingWord() {
  return (
    <span className="relative inline-block min-w-[7ch] text-left">
      {WORDS.map((w, i) => (
        <motion.span
          key={w}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [30, 0, 0, -30],
            filter: ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"],
          }}
          transition={{
            duration: WORDS.length * 2,
            times: [
              i / WORDS.length,
              (i + 0.15) / WORDS.length,
              (i + 0.85) / WORDS.length,
              (i + 1) / WORDS.length,
            ],
            repeat: Infinity,
            delay: 1,
          }}
          className="absolute left-0 top-0 whitespace-nowrap text-gradient"
        >
          {w}
        </motion.span>
      ))}
      <span className="invisible">fearless</span>
    </span>
  );
}
