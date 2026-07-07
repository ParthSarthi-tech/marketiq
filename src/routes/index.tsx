import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { Features } from "@/components/landing/Features";
import { AISection } from "@/components/landing/AISection";
import { VirtualPortfolio } from "@/components/landing/VirtualPortfolio";
import { Learn } from "@/components/landing/Learn";
import { HowItWorksReel } from "@/components/landing/HowItWorksReel";
import { CTA, Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MarketIQ — AI-powered stock picks for first-time investors" },
      { name: "description", content: "MarketIQ helps beginners pick the right stocks with live indicators, a virtual portfolio and personal AI recommendations based on your income, goals and risk." },
      { property: "og:title", content: "MarketIQ — Invest smarter. Start fearless." },
      { property: "og:description", content: "Personalized AI stock manager, live multi-sector dataset and a virtual portfolio. Built for new investors." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
  }),
});

function Index() {
  return (
    <main className="relative bg-background text-foreground min-h-screen snap-container">
      <MarketBackdrop />
      <Navbar />
      <div className="snap-section min-h-screen"><Hero /></div>
      <Ticker />
      <div className="snap-section"><Features /></div>
      <div className="snap-section"><AISection /></div>
      <HowItWorksReel />
      <div className="snap-section"><VirtualPortfolio /></div>
      <div className="snap-section"><Learn /></div>
      <div className="snap-section"><CTA /></div>
      <Footer />
    </main>
  );
}
