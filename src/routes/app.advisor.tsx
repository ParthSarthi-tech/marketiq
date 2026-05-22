import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Sparkles, TrendingUp, Shield, PieChart, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAI } from "@/hooks/useAI";

export const Route = createFileRoute("/app/advisor")({
  component: Advisor,
  head: () => ({ meta: [{ title: "AI Advisor — MarketIQ" }, { name: "description", content: "Chat with your personal AI investing advisor." }] }),
});

const suggestions = [
  { icon: PieChart, text: "Rebalance my portfolio" },
  { icon: TrendingUp, text: "What should I buy with ₹10,000?" },
  { icon: Shield, text: "Reduce my risk by 10%" },
  { icon: Wallet, text: "Explain my last week's P/L" },
];

function Advisor() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id ?? null);
  const { holdings, totalValue, cashBalance } = usePortfolio(user?.id ?? null);
  
  const context = useMemo(() => ({
    userProfile: profile ?? null,
    portfolio: holdings,
    portfolioValue: totalValue,
    cashBalance,
  }), [profile, holdings, totalValue, cashBalance]);
  
  const { messages, isLoading, sendMessage } = useAI(() => context);
  
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    await sendMessage(text);
  };

  const userName = user?.email?.split("@")[0] || "there";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-[calc(100vh-180px)]">
      {/* Chat panel */}
      <div className="rounded-3xl bg-gradient-card border border-border/60 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border/40">
          <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <div>
            <div className="font-semibold">MarketIQ Advisor</div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] animate-pulse-dot" /> Online · trained on Indian markets
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"
                  : "bg-card/60 border border-border/40 rounded-tl-sm"
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="bg-card/60 border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-border/40">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full glass hover:bg-card/60 hover:border-primary/40 transition"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" /> {s.text}
                </button>
              );
            })}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 bg-input/40 border border-border rounded-2xl px-4 py-2 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)] transition"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything — 'Is HDFCBANK a buy at 1670?'"
              className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder:text-muted-foreground/60"
            />
            <button type="submit" className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow hover:opacity-90 transition">
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </form>
        </div>
      </div>

      {/* Insight sidebar */}
      <div className="space-y-4">
        <div className="rounded-3xl p-5 bg-gradient-card border border-border/60">
          <div className="text-[10px] uppercase tracking-wider font-mono text-primary mb-2">Your profile</div>
          <div className="font-semibold mb-3">
            {profile?.risk_appetite === "high" ? "Aggressive" 
              : profile?.risk_appetite === "med-high" ? "Moderate · Aggressive"
              : profile?.risk_appetite === "med-low" ? "Moderate · Conservative"
              : profile?.risk_appetite === "low" ? "Conservative"
              : "Getting started"}
          </div>
          {[
            { label: "Risk appetite", val: profile?.risk_appetite === "high" ? 90 : profile?.risk_appetite === "med-high" ? 70 : profile?.risk_appetite === "med-low" ? 45 : profile?.risk_appetite === "low" ? 25 : 50 },
            { label: "Time horizon", val: profile?.time_horizon === "gt7" ? 90 : profile?.time_horizon === "3to7" ? 70 : profile?.time_horizon === "1to3" ? 40 : 20 },
            { label: "Diversification", val: holdings.length >= 5 ? 80 : holdings.length >= 3 ? 60 : 30 },
          ].map((p) => (
            <div key={p.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-mono tabular-nums">{p.val}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.val}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-primary" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-5 bg-gradient-card border border-border/60">
          <div className="text-[10px] uppercase tracking-wider font-mono text-accent mb-2">This week</div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><span className="text-[var(--bull)]">▲</span> NIFTY tested 24,900 resistance twice.</li>
            <li className="flex gap-2"><span className="text-[var(--bear)]">▼</span> IT index slipped 1.4% on weak guidance.</li>
            <li className="flex gap-2"><span className="text-accent">●</span> RBI policy meet on Friday — watch banks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
