import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, Wallet, Brain, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Live blinkers across sectors",
    desc: "Real-time indicators on thousands of stocks. Spot momentum the second it happens — pulsing signals you can read at a glance.",
    accent: "bull",
  },
  {
    icon: Wallet,
    title: "Virtual portfolio playground",
    desc: "Get virtual money. Build a portfolio. Watch it grow or dip in real time — zero risk, all the lessons.",
    accent: "gold",
  },
  {
    icon: Brain,
    title: "AI post-trade insights",
    desc: "If you're up, AI tells you why. If you're down, it shows you what you should have done — turning every move into a lesson.",
    accent: "bull",
  },
  {
    icon: BarChart3,
    title: "Multi-sector dataset",
    desc: "Tech, pharma, energy, FMCG, banking and more. Filter, compare, decide — with one of the deepest datasets on the planet.",
    accent: "gold",
  },
  {
    icon: ShieldCheck,
    title: "Risk-aware suggestions",
    desc: "Every recommendation is matched to your personal risk profile. No more guessing if a stock is right for you.",
    accent: "bull",
  },
  {
    icon: Sparkles,
    title: "Time-management coaching",
    desc: "Learn when to check, when to hold and when to walk away. Investing without burning your day.",
    accent: "gold",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".ft-bg", {
        scale: 1.2, opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: ".ft-section", start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
      gsap.fromTo(".ft-content",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: "none",
          scrollTrigger: { trigger: ".ft-section", start: "top 75%", end: "top 30%", scrub: 1 },
        },
      );
      gsap.fromTo(".ft-card",
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.08, ease: "none",
          scrollTrigger: { trigger: ".ft-section", start: "top 70%", end: "center 40%", scrub: 1 },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="ft-section relative py-32 overflow-hidden">
      <div className="ft-bg absolute inset-0 bg-gradient-radial opacity-40 -z-10" style={{ willChange: "transform" }} />
      <div className="mx-auto max-w-7xl px-6">
         <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="ft-content text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
            Everything in one terminal
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">
            A trading desk, <span className="text-gradient">designed for beginners</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg">
            From live tickers to a virtual portfolio with AI hindsight — every tool a new investor needs, none they don't.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="ft-card group relative glass rounded-3xl p-7 hover:bg-card/70 transition overflow-hidden"
            >
              <div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-30 transition duration-700 blur-3xl"
                style={{ background: f.accent === 'bull' ? 'var(--bull)' : 'var(--gold)' }}
              />
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: f.accent === 'bull'
                    ? 'oklch(0.78 0.18 155 / 0.15)'
                    : 'oklch(0.85 0.16 90 / 0.15)',
                  color: f.accent === 'bull' ? 'var(--bull)' : 'var(--gold)',
                }}
              >
                <f.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
