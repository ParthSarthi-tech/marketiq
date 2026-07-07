import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DisclosureFooter } from "@/components/DisclosureFooter";

export function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta-card",
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, ease: "none",
          scrollTrigger: { trigger: ".cta-section", start: "top 80%", end: "top 35%", scrub: 1 },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="cta" className="cta-section relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="cta-card relative glass rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden animate-glow"
        >
          <div className="absolute inset-0 bg-gradient-radial opacity-50" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-primary opacity-20 blur-3xl" />

          <div className="relative">
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1]">
              Your first smart trade <br /> is{" "}
              <span className="text-gradient">two minutes away.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of new investors learning, practicing and growing with MarketIQ.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/sign-up"
                className="group bg-gradient-primary text-primary-foreground font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-glow hover:scale-105 transition"
              >
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/how-it-works"
                className="glass font-medium px-8 py-4 rounded-full inline-flex items-center gap-2 hover:bg-card transition"
              >
                <PlayCircle className="w-5 h-5 text-accent" />
                Take a guided demo
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              No credit card · Cancel anytime · Free virtual portfolio for life
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return <DisclosureFooter />;
}
