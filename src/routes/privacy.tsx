import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { CTA, Footer } from "@/components/landing/CTA";
import { Shield, Eye, Database, Trash2, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — MarketIQ" },
      { name: "description", content: "MarketIQ privacy policy — how we collect, use, and protect your data." },
    ],
  }),
});

function PrivacyPage() {
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
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
          </div>
        </motion.div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            </div>
            <p className="mb-3">When you create an account and use MarketIQ, we collect the following categories of data to provide and improve the service:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <div>
                  <strong className="text-foreground">Account information</strong> — email address and authentication credentials required to maintain a secure, personalised account.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <div>
                  <strong className="text-foreground">Profile data</strong> — risk tolerance, investment goals, time horizon, and income range collected during onboarding. This data never leaves our database and is only used to tailor analysis to your profile.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <div>
                  <strong className="text-foreground">Portfolio data</strong> — stocks you add, quantities, average buy prices, transaction history, and virtual cash balance. This is the core data that powers your dashboard.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <div>
                  <strong className="text-foreground">Usage data</strong> — page views, feature interactions, and session duration to help us understand how the platform is used and where to improve.
                </div>
              </li>
            </ul>
            <p className="mt-3 text-xs">We do <strong className="text-foreground">not</strong> collect sensitive financial identifiers such as PAN, Aadhaar, bank account numbers, or Demat account details — because no real-money transactions occur on this platform.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>To generate personalised AI-powered stock analysis and portfolio insights based on your risk profile and holdings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>To maintain your virtual portfolio, transaction history, and performance tracking across sessions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>To curate stock recommendations and learning content matched to your experience level and goals.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span>To analyse aggregate usage patterns and improve platform performance, UI, and feature relevance.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
            </div>
            <p>Your data is stored on secure cloud infrastructure with encryption in transit (TLS 1.3) and at rest. Access to the database is restricted to authenticated server-side requests only — no direct public access is permitted. We retain your data for as long as your account is active. If you delete your account, all associated data is permanently removed within 30 days.</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/40">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--bull)" }} /> Encrypted in transit
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/40">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--bull)" }} /> Encrypted at rest
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/40">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--bull)" }} /> No data shared with third parties
              </span>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">4. Your Rights & Control</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">Access</strong> — You can view all data associated with your account at any time from the dashboard.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">Rectification</strong> — You can update your profile, risk preferences, and portfolio at any time.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">Deletion</strong> — You can clear your transaction history or reset your portfolio from settings. To delete your account entirely, contact us.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bull)" }} />
                <span><strong className="text-foreground">Portability</strong> — Your portfolio data can be exported in CSV format from the portfolio page.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
            </div>
            <p>For privacy-related inquiries, account deletion requests, or data access questions, please reach out through the support channels available in the app or contact the project maintainer directly. We aim to respond within 7 business days.</p>
          </section>

          <section className="glass rounded-2xl p-6 border border-[var(--bear)]/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.6 0.2 25 / 0.15)" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--bear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--bear)" }}>Important</h3>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.6 0.1 25)" }}>
                  MarketIQ is an educational platform. We do not collect or store any real financial instruments, bank details, or payment information. All portfolio activity is purely virtual and has no real-world financial value or consequence.
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
