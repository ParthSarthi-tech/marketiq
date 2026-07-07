import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import heroImg from "@/assets/hero-chart.jpg";
import floatTicker from "@/assets/float-ticker.png";
import floatAi from "@/assets/float-ai.png";
import floatPortfolio from "@/assets/float-portfolio.png";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".gsap-hero-content", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: "power3.out" });
      gsap.fromTo(".gsap-stat", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, delay: 0.8, ease: "back.out(1.7)" });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen pt-32 pb-20 overflow-hidden grid-bg">
      {/* Backdrop */}
      <motion.div style={{ scale, opacity }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial" />
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </motion.div>

      {/* Floating elements */}
      <motion.img
        src={floatTicker} alt="" loading="lazy" width={300} height={300}
        style={{ y: y1 }}
        className="absolute top-32 right-[8%] w-48 md:w-72 animate-float opacity-90 drop-shadow-[0_0_40px_oklch(0.78_0.18_155_/_0.5)]"
      />
      <motion.img
        src={floatAi} alt="" loading="lazy" width={260} height={260}
        style={{ y: y2 }}
        className="absolute top-[55%] left-[5%] w-40 md:w-60 animate-float opacity-85 drop-shadow-[0_0_50px_oklch(0.85_0.16_90_/_0.5)]"
      />
      <motion.img
        src={floatPortfolio} alt="" loading="lazy" width={220} height={220}
        style={{ y: y3 }}
        className="absolute bottom-20 right-[15%] w-32 md:w-48 animate-float opacity-80 drop-shadow-[0_0_40px_oklch(0.78_0.18_155_/_0.4)]"
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center gsap-hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-muted-foreground">AI-powered for first-time investors</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tighter max-w-5xl mx-auto"
        >
          Invest smarter.<br />
          <span className="text-gradient">Start fearless.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          MarketIQ pairs a vast NSE & BSE dataset with personalized AI guidance — so Indian beginners pick the right stocks for <em className="text-foreground not-italic">their</em> goals, risk and timeline.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link to="/sign-up" className="group bg-gradient-primary text-primary-foreground font-semibold px-7 py-4 rounded-full inline-flex items-center gap-2 shadow-glow hover:scale-105 transition">
            Start free demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link to="/how-it-works" className="glass font-medium px-7 py-4 rounded-full inline-flex items-center gap-2 hover:bg-card transition">
            <PlayCircle className="w-5 h-5 text-accent" />
            Watch how it works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto gsap-stat"
        >
          {[
            { v: "5K+", l: "NSE & BSE stocks" },
            { v: "23", l: "Sectors covered" },
            { v: "98%", l: "Beginner satisfaction" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display font-bold text-3xl md:text-4xl text-gradient">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
