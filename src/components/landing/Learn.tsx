import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, BookOpen, Award } from "lucide-react";

const tips = [
  { icon: Clock, title: "15 minutes a day", desc: "Build a daily ritual. We'll surface only what changed and what matters." },
  { icon: BookOpen, title: "Bite-sized lessons", desc: "From P/E ratios to options — each concept in under 3 minutes." },
  { icon: Award, title: "Earn confidence badges", desc: "Track your growth as an investor. Every milestone celebrated." },
];

export function Learn() {
  const sectionRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".ln-bg", {
        scale: 1.15, opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: ".ln-section", start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
      gsap.fromTo(".ln-content",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: "none",
          scrollTrigger: { trigger: ".ln-section", start: "top 75%", end: "top 35%", scrub: 1 },
        },
      );
      gsap.fromTo(".ln-card",
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, ease: "none",
          scrollTrigger: { trigger: ".ln-section", start: "top 70%", end: "center 35%", scrub: 1 },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="learn" className="ln-section relative py-32 overflow-hidden">
      <div className="ln-bg absolute inset-0 bg-gradient-radial opacity-30 -z-10" style={{ willChange: "transform" }} />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="ln-content text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
            You're not just an investor. <span className="text-gradient">You're learning.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">Every screen designed to make you feel capable, calm, and in control of your money.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {tips.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="ln-card glass rounded-3xl p-8 text-center hover:bg-card/60 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-5">
                <t.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
