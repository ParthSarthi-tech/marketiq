import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Sparkles, TrendingUp, Wallet, Target, Clock, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSaveQuizResponse } from "@/hooks/useUserProfile";
import { hasCompletedOnboarding } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Welcome — MarketIQ" }, { name: "description", content: "A 60-second quiz to personalise your investing advisor." }] }),
});

type Step = {
  id: string;
  icon: any;
  question: string;
  hint: string;
  options: { label: string; sub?: string; value: string }[];
};

const steps: Step[] = [
  {
    id: "income",
    icon: Wallet,
    question: "What's your monthly income range?",
    hint: "Used to size suggested SIPs — never shared.",
    options: [
      { label: "Under ₹50,000", value: "lt50" },
      { label: "₹50,000 – ₹1L", value: "50to1" },
      { label: "₹1L – ₹3L", value: "1to3" },
      { label: "Above ₹3L", value: "gt3" },
    ],
  },
  {
    id: "goal",
    icon: Target,
    question: "What are you investing for?",
    hint: "Pick the one that matters most right now.",
    options: [
      { label: "Wealth building", sub: "Long-term compounding", value: "wealth" },
      { label: "House / big purchase", sub: "3-7 year goal", value: "house" },
      { label: "Retirement", sub: "15+ years away", value: "retire" },
      { label: "Just learning", sub: "Virtual only for now", value: "learn" },
    ],
  },
  {
    id: "horizon",
    icon: Clock,
    question: "How long can you stay invested?",
    hint: "Longer horizons unlock higher-return strategies.",
    options: [
      { label: "Under 1 year", value: "lt1" },
      { label: "1 – 3 years", value: "1to3" },
      { label: "3 – 7 years", value: "3to7" },
      { label: "7+ years", value: "gt7" },
    ],
  },
  {
    id: "risk",
    icon: Shield,
    question: "If your portfolio dropped 20% in a month, you would…",
    hint: "Be honest — there are no wrong answers.",
    options: [
      { label: "Sell everything", sub: "Protect what's left", value: "low" },
      { label: "Sell a little", sub: "Cushion the fall", value: "med-low" },
      { label: "Hold tight", sub: "Trust the plan", value: "med-high" },
      { label: "Buy more", sub: "It's on sale", value: "high" },
    ],
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const saveQuiz = useSaveQuizResponse();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const step = steps[i];
  const Icon = step?.icon ?? Sparkles;
  const progress = ((i + (done ? 1 : 0)) / steps.length) * 100;

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low": return "Conservative";
      case "med-low": return "Moderate Conservative";
      case "med-high": return "Moderate Aggressive";
      case "high": return "Aggressive";
      default: return "Moderate";
    }
  };

  const choose = async (v: string) => {
    setAnswers((a) => ({ ...a, [step.id]: v }));
    
    if (i < steps.length - 1) {
      setTimeout(() => setI(i + 1), 240);
    } else {
      setDone(true);
      if (user) {
        setSaving(true);
        try {
          await saveQuiz.mutateAsync({
            userId: user.id,
            data: {
              income_level: answers.income || "",
              investment_amount: "",
              goal: answers.goal || "",
              risk_appetite: answers.risk || "med-high",
              time_horizon: answers.horizon || "gt7",
              knowledge_level: "beginner",
              sector_preference: [],
              portfolio_mode: "virtual",
              portfolio_resets_remaining: 3,
              starting_balance: 250000,
            },
          });
        } catch (e) {
          console.error("Failed to save quiz:", e);
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const handleEnterApp = () => {
    navigate({ to: "/app" });
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          <span>Step {Math.min(i + 1, steps.length)} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-8 bg-gradient-card border border-border/60"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-5">
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-2">{step.question}</h2>
            <p className="text-sm text-muted-foreground mb-6">{step.hint}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {step.options.map((o, idx) => {
                const selected = answers[step.id] === o.value;
                return (
                  <motion.button
                    key={o.value}
                    onClick={() => choose(o.value)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    className={`text-left p-4 rounded-2xl border transition relative ${
                      selected ? "border-primary bg-primary/10 shadow-glow" : "border-border/60 bg-card/40 hover:border-primary/40"
                    }`}
                  >
                    <div className="font-medium">{o.label}</div>
                    {o.sub && <div className="text-xs text-muted-foreground mt-0.5">{o.sub}</div>}
                    {selected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setI(Math.max(0, i - 1))}
                disabled={i === 0}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => navigate({ to: "/app" })}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-10 bg-gradient-card border border-border/60 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="w-20 h-20 mx-auto rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow mb-6"
            >
              {saving ? <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" /> : <TrendingUp className="w-10 h-10 text-primary-foreground" />}
            </motion.div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-mono mb-2">{saving ? "Setting up..." : "Profile ready"}</div>
            <h2 className="font-display text-4xl font-semibold tracking-tight mb-3">
              You're a <span className="text-gradient">{getRiskLabel(answers.risk || "med-high")}</span> investor.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {saving 
                ? "Configuring your personalized dashboard..." 
                : "We've matched stocks to your profile and seeded your virtual portfolio with ₹2.5L to practise."}
            </p>
            <motion.button
              onClick={handleEnterApp}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-60"
            >
              {saving ? "Please wait..." : "Enter workspace"} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
