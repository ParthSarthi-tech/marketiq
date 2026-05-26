import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Wallet,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { resetPortfolio } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — MarketIQ" },
      { name: "description", content: "Manage your MarketIQ account, profile and preferences." },
    ],
  }),
});

const sections = [
  {
    title: "Profile",
    icon: User,
    items: [
      { label: "Risk profile", desc: "View your investor personality", action: "Retake quiz" },
      { label: "Account", desc: "Email and personal details", action: "Manage" },
    ],
  },
  {
    title: "Portfolio",
    icon: Wallet,
    items: [
      { label: "Reset portfolio", desc: "Start fresh with ₹2.5L virtual cash", action: "Reset" },
      { label: "Cash balance", desc: "Virtual funds available for trading", action: "View" },
    ],
  },
  {
    title: "Preferences",
    icon: Bell,
    items: [
      { label: "Notifications", desc: "Market alerts and AI signal updates", action: "Configure" },
      { label: "Theme", desc: "Appearance and display settings", action: "Coming soon" },
    ],
  },
];

const riskLabels: Record<string, string> = {
  low: "Conservative",
  "med-low": "Moderate Conservative",
  "med-high": "Moderate Aggressive",
  high: "Aggressive",
};

function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile(user?.id ?? null);
  const { holdings, cashBalance, totalValue } = usePortfolio(user?.id ?? null);

  const [resetting, setResetting] = useState(false);

  const userName = user?.email?.split("@")[0] || "User";
  const riskLabel = profile?.risk_appetite
    ? riskLabels[profile.risk_appetite] || "Not set"
    : "Not set";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleResetPortfolio = async () => {
    if (!user?.id) return;
    if (
      !window.confirm(
        "Reset your portfolio? This will clear all holdings and restore ₹2,50,000 virtual cash.",
      )
    )
      return;
    setResetting(true);
    try {
      await resetPortfolio(user.id);
      queryClient.invalidateQueries({ queryKey: ["portfolio", user.id] });
      queryClient.invalidateQueries({ queryKey: ["cashBalance", user.id] });
      toast.success("Portfolio reset", {
        description: "Your virtual portfolio has been reset to ₹2,50,000.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Reset failed", { description: "Could not reset portfolio. Try again." });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title={
          <>
            Your <span className="text-gradient">Account</span>
          </>
        }
        subtitle="Manage your profile, portfolio and preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section, si) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 + 0.1 }}
                className="rounded-3xl p-6 bg-gradient-card border border-border/60"
              >
                <div className="flex items-center gap-2 mb-4">
                  <SectionIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{section.title}</span>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/40 transition cursor-pointer group"
                      onClick={() => {
                        if (item.label === "Risk profile") navigate({ to: "/app/onboarding" });
                        if (item.label === "Reset portfolio") handleResetPortfolio();
                        if (item.label === "Notifications") {
                          /* placeholder */
                        }
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary font-medium">
                        {item.action} <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-6 bg-gradient-card border border-border/60"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-3">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-lg">{userName}</div>
            <div className="text-xs text-muted-foreground mt-1">{user?.email}</div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Shield className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="text-muted-foreground">{riskLabel} investor</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--bull)]" />
              <span className="text-muted-foreground">
                {holdings.length} holding{holdings.length !== 1 ? "s" : ""} · ₹
                {totalValue.toLocaleString("en-IN")}
              </span>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleSignOut}
            className="w-full rounded-3xl p-4 bg-gradient-card border border-border/60 flex items-center justify-between hover:border-destructive/40 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Sign out</div>
                <div className="text-xs text-muted-foreground">End your current session</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
