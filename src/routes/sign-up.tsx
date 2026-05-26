import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Get started — MarketIQ" },
      {
        name: "description",
        content:
          "Create your free MarketIQ account. Virtual portfolio, AI advisor and Indian market lessons — built for first-time investors.",
      },
      { property: "og:title", content: "Get started — MarketIQ" },
      {
        property: "og:description",
        content: "Two minutes to set up. A lifetime of clarity, confidence and compounding.",
      },
    ],
  }),
});

function SignUpPage() {
  return (
    <AuthShell
      side="up"
      eyebrow="Get started — free"
      title={
        <>
          Open your <span className="text-gradient">MarketIQ</span> account.
        </>
      }
      subtitle="No credit card. Free virtual portfolio for life."
      footer={
        <>
          Already investing with us?{" "}
          <Link
            to="/sign-in"
            search={{ confirmed: undefined }}
            className="text-foreground font-semibold hover:text-accent transition story-link"
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="up" cta="Create account" />
    </AuthShell>
  );
}
