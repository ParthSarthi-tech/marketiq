import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { CTA, Footer } from "@/components/landing/CTA";
import { ScrollText, AlertTriangle, Scale, BookOpen, Ban, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — MarketIQ" },
      { name: "description", content: "MarketIQ terms of service governing use of the platform." },
    ],
  }),
});

function TermsPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <MarketBackdrop />
      <Navbar />
      <div className="relative pt-28 px-6 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <ScrollText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
          </div>
        </motion.div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="glass rounded-2xl p-6 border border-[var(--bear)]/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.6 0.2 25 / 0.15)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--bear)" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--bear)" }}>Read Carefully</h3>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.6 0.1 25)" }}>
                  By creating an account or using MarketIQ in any way, you acknowledge that you have read, understood, and agreed to be bound by these terms. If you do not agree, do not use the platform.
                </p>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">1. Educational Purpose Only</h2>
            </div>
            <p>MarketIQ is expressly designed as an <strong className="text-foreground">educational and informational platform</strong> for stock market analysis, learning, and virtual portfolio management. The platform simulates real-world market conditions using publicly available fundamental data and live price feeds for practice and learning purposes.</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">No investment advice.</strong> We do not recommend, endorse, or solicit the purchase or sale of any security.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">No SEBI registration.</strong> MarketIQ is not registered with SEBI as an investment advisor, research analyst, or portfolio manager.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">No real money.</strong> All portfolio activity is virtual. No real securities are bought, sold, or held.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Ban className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">2. No Liability</h2>
            </div>
            <p>MarketIQ, its creators, contributors, and affiliates shall <strong className="text-foreground">not be held liable</strong> for any financial losses, investment decisions, or trading actions taken based on content from this platform. This includes but is not limited to:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bear)" }} />
                <span>AI-generated stock scores, signals, and analysis — these are algorithmic outputs, not financial advice.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bear)" }} />
                <span>Price data, quotes, and market information — sourced from third-party feeds and subject to delays or inaccuracies.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bear)" }} />
                <span>Virtual portfolio performance — past simulated returns do not predict or guarantee future real-world results.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">3. Virtual Trading & No Real Value</h2>
            </div>
            <p>All portfolio management features on MarketIQ operate exclusively in a simulated environment using virtual Indian rupee (₹) currency. Key points:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>Virtual gains and losses have <strong className="text-foreground">zero financial value</strong> and cannot be redeemed, transferred, or converted to real money.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>No real orders are placed with any exchange, broker, or trading platform through MarketIQ.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>Starting balance is ₹2,50,000 virtual cash. This is an arbitrary practice amount and does not represent a recommendation of corpus size.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">4. User Responsibilities</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>You agree not to misuse the platform for any unlawful purpose or in violation of Indian laws and regulations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>You must be at least 18 years of age to create an account.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>You should consult a SEBI-registered investment advisor before making any real investment decisions.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">5. Termination</h2>
            </div>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behaviour, or attempt to compromise platform security. You may delete your account and associated data at any time by contacting us.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">6. Governing Law</h2>
            </div>
            <p>These terms are governed by the laws of India. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section className="glass rounded-2xl p-6 border border-[var(--bear)]/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.6 0.2 25 / 0.15)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--bear)" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--bear)" }}>Risk Reminder</h3>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.6 0.1 25)" }}>
                  The stock market involves risk, including potential loss of principal. According to SEBI data, over 90% of individual traders in equity F&O segments incurred net losses in FY23. Past performance of any stock, index, or strategy is not indicative of future results. Never invest money you cannot afford to lose. Please invest responsibly after consulting a qualified professional.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">&larr; Back to home</Link>
        </div>
      </div>
      <CTA />
      <Footer />
    </main>
  );
}
