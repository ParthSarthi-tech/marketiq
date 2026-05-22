import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  head: () => ({
    meta: [
      { title: "Sign in — MarketIQ" },
      { name: "description", content: "Sign in to your MarketIQ account to access your virtual portfolio, AI advisor and live market signals." },
      { property: "og:title", content: "Sign in — MarketIQ" },
      { property: "og:description", content: "Continue your investing journey with MarketIQ." },
    ],
  }),
});

function SignInPage() {
  return (
    <AuthShell
      side="in"
      eyebrow="Sign in"
      title={<>Welcome <span className="text-gradient">back</span>.</>}
      subtitle="Resume your portfolio, watchlist and learning streak."
      footer={
        <>
          New to MarketIQ?{" "}
          <Link to="/sign-up" className="text-foreground font-semibold hover:text-accent transition story-link">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm mode="in" cta="Sign in" />
    </AuthShell>
  );
}
