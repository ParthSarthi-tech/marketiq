import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app")({
  component: AppShell,
  head: () => ({
    meta: [
      { title: "Workspace — MarketIQ" },
      { name: "description", content: "Your MarketIQ workspace — virtual portfolio, AI advisor, discover and learn." },
    ],
  }),
});
