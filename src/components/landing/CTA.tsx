import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, TrendingUp } from "lucide-react";
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
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Market<span className="text-gradient">IQ</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your smart stock guide for first-time investors. Learn, practice and grow with virtual
              portfolios and AI-powered insights.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Quick links
            </div>
            <div className="space-y-2">
              <Link
                to="/features"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Features
              </Link>
              <Link
                to="/how-it-works"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                How it works
              </Link>
              <Link
                to="/learn"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Learn
              </Link>
              <Link
                to="/sign-up"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Get started
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Legal
            </div>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-foreground transition"
              >
                Disclosures
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card/40 border border-border/40 p-4 mb-6">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Disclaimer:</strong> MarketIQ is an educational
            platform for stock market analysis and virtual portfolio management. We do NOT provide
            investment advice, stock recommendations, or trading tips. All content — including AI
            signals, scores, and analysis — is based on fundamental data analysis and proprietary
            models for informational and educational purposes only. Investing in the stock market
            involves risk, including potential loss of principal. Past performance is not indicative
            of future results. Please consult a SEBI-registered investment advisor before making any
            investment decisions. MarketIQ is not registered with SEBI as an investment advisor.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Parth Sarthi C. All rights reserved.</div>
          <div className="flex gap-4">
            <span>Made with caution for smarter investing.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
