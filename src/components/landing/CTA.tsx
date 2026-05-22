import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section id="cta" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative glass rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden animate-glow"
        >
          <div className="absolute inset-0 bg-gradient-radial opacity-50" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-primary opacity-20 blur-3xl" />

          <div className="relative">
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1]">
              Your first smart trade <br /> is <span className="text-gradient">two minutes away.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of new investors learning, practicing and growing with MarketIQ.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/sign-up" className="group bg-gradient-primary text-primary-foreground font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-glow hover:scale-105 transition">
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <button className="glass font-medium px-8 py-4 rounded-full inline-flex items-center gap-2 hover:bg-card transition">
                <PlayCircle className="w-5 h-5 text-accent" />
                Take a guided demo
              </button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">No credit card · Cancel anytime · Free virtual portfolio for life</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© 2026 MarketIQ. Built for first-time investors.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Disclosures</a>
        </div>
      </div>
    </footer>
  );
}
