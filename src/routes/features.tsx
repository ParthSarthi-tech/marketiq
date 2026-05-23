import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity, Wallet, Brain, BarChart3, ShieldCheck,
  Bell, Layers, LineChart, Target, Clock, GraduationCap, Zap, Users,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { Ticker } from "@/components/landing/Ticker";
import { Footer } from "@/components/landing/CTA";
import { Comparison } from "@/components/landing/Comparison";
import { FeaturesHero } from "@/components/landing/FeaturesHero";
import Dither from "@/components/landing/Dither";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — MarketIQ | Live data, AI picks & virtual portfolio" },
      { name: "description", content: "Explore every MarketIQ feature: live NSE & BSE indicators, AI-matched stock picks, a risk-free virtual portfolio, post-trade hindsight and time-management coaching for new investors." },
      { property: "og:title", content: "Every MarketIQ feature, in one place" },
      { property: "og:description", content: "Live blinkers, AI advisor, virtual portfolio, hindsight insights and learning paths — built for first-time Indian investors." },
    ],
  }),
});

const pillars = [
  {
    icon: Activity,
    accent: "bull",
    title: "Live multi-sector blinkers",
    desc: "Real-time pulses on every NSE & BSE stock. Read the market at a glance — green for momentum up, red for cooling down.",
    points: ["1-second tick refresh", "Sector heatmaps", "Volume + price divergence alerts"],
  },
  {
    icon: Wallet,
    accent: "gold",
    title: "Virtual portfolio with ₹10L",
    desc: "Practice with real market data and zero risk. Build, rebalance, and watch your strategy play out live.",
    points: ["₹10,00,000 starting cash", "Realistic order book & fees", "Full P&L history"],
  },
  {
    icon: Brain,
    accent: "bull",
    title: "AI hindsight on every trade",
    desc: "Up? AI tells you why. Down? It shows you what you should've done. Every move becomes a lesson.",
    points: ["Trade-by-trade explainer", "Counterfactual 'what-if' replays", "Pattern detection on your behaviour"],
  },
  {
    icon: BarChart3,
    accent: "gold",
    title: "Deepest Indian dataset",
    desc: "5,000+ stocks across IT, Pharma, Energy, FMCG, Banking, Auto and more. Filter, compare, decide in seconds.",
    points: ["10-year fundamentals", "Sectoral & peer comparison", "Custom screeners"],
  },
];

const grid = [
  { icon: ShieldCheck, title: "Risk-aware suggestions", desc: "Every pick matched to your risk profile, income and goals." },
  { icon: Bell, title: "Smart price alerts", desc: "Get pinged only when something matters. No noise, no spam." },
  { icon: Layers, title: "Sector rotation view", desc: "See where money is flowing today — and where it's leaving." },
  { icon: LineChart, title: "Charting that explains itself", desc: "Hover any candle — AI tells you what just happened." },
  { icon: Target, title: "Goal-based investing", desc: "Set a target (₹10L in 3 yrs). We reverse-engineer the plan." },
  { icon: Clock, title: "Time-management coaching", desc: "Learn when to check, when to hold, when to walk away." },
  { icon: GraduationCap, title: "Beginner learning path", desc: "Bite-sized lessons unlock as you grow. No jargon walls." },
  { icon: Zap, title: "One-tap rebalance", desc: "AI suggests the cleanest path back to your target allocation." },
  { icon: Users, title: "Community plays (read-only)", desc: "See what verified mentors are doing — never blindly copy." },
];

function FeaturesPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <MarketBackdrop />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18] mix-blend-screen">
        <Dither
          waveColor={[0.18, 0.55, 0.36]}
          waveSpeed={0.025}
          waveFrequency={2.4}
          waveAmplitude={0.28}
          colorNum={5}
          pixelSize={2}
          enableMouseInteraction={false}
          mouseRadius={0.3}
        />
      </div>
      <Navbar />

      {/* Hero */}
      <FeaturesHero />


      <Ticker />

      {/* Pillars */}
      <section id="pillars" className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              Four pillars. <span className="text-gradient">One unfair advantage.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group relative glass rounded-3xl p-8 hover:bg-card/70 transition overflow-hidden"
              >
                <div
                  className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-0 group-hover:opacity-30 transition duration-700 blur-3xl"
                  style={{ background: p.accent === "bull" ? "var(--bull)" : "var(--gold)" }}
                />
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: p.accent === "bull"
                      ? "oklch(0.78 0.18 155 / 0.15)"
                      : "oklch(0.85 0.16 90 / 0.15)",
                    color: p.accent === "bull" ? "var(--bull)" : "var(--gold)",
                  }}
                >
                  <p.icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-2xl mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">{p.desc}</p>
                <ul className="space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--bull)" }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
              And <span className="text-gradient">a hundred</span> small things you'll love.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="glass rounded-2xl p-6 hover:bg-card/70 transition"
              >
                <g.icon className="w-6 h-6 mb-4" style={{ color: "var(--bull)" }} />
                <h3 className="font-display font-bold text-lg mb-1.5">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Comparison />

      {/* CTA */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-4xl md:text-6xl tracking-tighter"
          >
            Ready to invest <span className="text-gradient">fearless?</span>
          </motion.h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Start with the virtual portfolio. Graduate to real money when you're ready — not a day before.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/sign-up" className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition shadow-glow inline-flex items-center gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works" className="glass text-sm font-medium px-7 py-3.5 rounded-full hover:bg-card/70 transition">
              Take a demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

