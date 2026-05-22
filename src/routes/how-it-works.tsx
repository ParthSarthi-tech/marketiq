import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { MarketBackdrop } from "@/components/landing/MarketBackdrop";
import { Ticker } from "@/components/landing/Ticker";
import { HowItWorksReel } from "@/components/landing/HowItWorksReel";
import { CTA, Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () => ({
    meta: [
      { title: "How MarketIQ works — Watch the 25-second walkthrough" },
      { name: "description", content: "An animated walkthrough: take the quiz, get matched by AI, pick stocks, build a virtual portfolio and watch it grow." },
      { property: "og:title", content: "How MarketIQ works — Quiz to AI to portfolio in 25s" },
      { property: "og:description", content: "Watch the live, auto-playing reel of MarketIQ's flow — built for first-time Indian investors." },
    ],
  }),
});

function HowItWorksPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <MarketBackdrop />
      <Navbar />
      <div className="pt-28">
        <Ticker />
      </div>
      <HowItWorksReel />
      <CTA />
      <Footer />
    </main>
  );
}
