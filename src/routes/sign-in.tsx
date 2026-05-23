import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>) => ({
    confirmed: search.confirmed === "false" ? ("false" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — MarketIQ" },
      {
        name: "description",
        content:
          "Sign in to your MarketIQ account to access your virtual portfolio, AI advisor and live market signals.",
      },
      { property: "og:title", content: "Sign in — MarketIQ" },
      { property: "og:description", content: "Continue your investing journey with MarketIQ." },
    ],
  }),
});

function SignInPage() {
  const { confirmed } = useSearch({ from: "/sign-in" });

  return (
    <AuthShell
      side="in"
      eyebrow="Sign in"
      title={
        <>
          Welcome <span className="text-gradient">back</span>.
        </>
      }
      subtitle="Resume your portfolio, watchlist and learning streak."
      footer={
        <>
          New to MarketIQ?{" "}
          <Link
            to="/sign-up"
            className="text-foreground font-semibold hover:text-accent transition story-link"
          >
            Create an account
          </Link>
        </>
      }
    >
      <AnimatePresence>
        {confirmed === "false" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-sm mb-4"
          >
            <Mail className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <span>Account created! Check your email to verify, then sign in below.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthForm mode="in" cta="Sign in" />
    </AuthShell>
  );
}
