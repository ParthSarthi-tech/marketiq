import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

const WORDS = ["thinks", "teaches", "warns", "explains", "rewards"];

export function FeaturesHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = "The toolkit that ".split("");

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".fh-bg-glow", {
        scale: 1.3, opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: ".fh-section", start: "top top", end: "bottom top", scrub: 1.5 },
      });
      gsap.to(".fh-content", {
        y: -60, opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".fh-section", start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(".fh-line", {
        scaleX: 0,
        ease: "none",
        scrollTrigger: { trigger: ".fh-section", start: "top top", end: "bottom top", scrub: 1 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="fh-section relative pt-36 pb-24 overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial opacity-60 fh-bg-glow" style={{ willChange: "transform" }} />
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-24 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 155 / 0.35), transparent 60%)" }}
        />
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fh-line absolute top-32 left-0 right-0 h-px origin-left"
        style={{ background: "linear-gradient(90deg, transparent, var(--bull), transparent)" }}
      />

      <motion.div style={{ y }} className="fh-content relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-2.5 h-2.5 rounded-full animate-ping" style={{ background: "var(--bull)" }} />
            <span className="relative w-2 h-2 rounded-full" style={{ background: "var(--bull)" }} />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            FEATURES · LIVE TOUR · v2.5
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
              {headline.join("")}
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
              with you.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 text-center text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Not another charting app. A second brain that watches the tape, flags the risk,
          and grows louder the moment your attention matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mt-12 grid grid-cols-3 max-w-2xl mx-auto gap-px rounded-2xl glass overflow-hidden"
        >
          {[
            { k: "5,000+", v: "NSE & BSE stocks" },
            { k: "<1s", v: "tick latency" },
            { k: "₹10L", v: "virtual cash" },
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
          >
            <Link to="/sign-up" className="group relative bg-gradient-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-full transition shadow-glow inline-flex items-center gap-2 overflow-hidden">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              Open the live tour <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </motion.div>
          <a href="#pillars" className="glass text-sm font-medium px-6 py-3 rounded-full hover:bg-card/70 transition">
            Skip to pillars ↓
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function RotatingWord() {
  return (
    <span className="relative inline-block min-w-[5ch] text-left">
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
      <span className="invisible">explains</span>
    </span>
  );
}
