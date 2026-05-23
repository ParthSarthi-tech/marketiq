import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PieChart,
  Sparkles,
  Compass,
  GraduationCap,
  Bell,
  Search,
  Settings,
  LogOut,
  TrendingUp,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth, hasCompletedOnboarding } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { STOCK_CONFIG, getAllTickers, getStockName } from "@/lib/stockMetadata";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { toast } from "sonner";

const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/app/discover", label: "Discover", icon: Compass },
  { to: "/app/watchlist", label: "Watchlist", icon: Eye },
  { to: "/app/advisor", label: "AI Advisor", icon: Sparkles },
  { to: "/app/learn", label: "Learn", icon: GraduationCap },
];

export function AppShell() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated, loading, initialized } = useAuth();
  const { data: profile } = useUserProfile(user?.id ?? null);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate({ to: "/sign-in" });
    }
  }, [initialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (initialized && isAuthenticated && user && loc.pathname === "/app") {
      hasCompletedOnboarding(user.id).then((onboarded) => {
        if (!onboarded) {
          navigate({ to: "/app/onboarding" });
        }
      });
    }
  }, [initialized, isAuthenticated, user?.id]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ ticker: string; name: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = getAllTickers()
      .filter((t) => t.toLowerCase().includes(q) || getStockName(t).toLowerCase().includes(q))
      .map((t) => ({ ticker: t, name: getStockName(t) }))
      .slice(0, 6);
    setSearchResults(results);
    setShowSearch(results.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  const current = nav.find((n) => isActive(n.to, n.exact))?.label ?? "Workspace";

  const userName = user?.email?.split("@")[0] || "User";
  const riskProfile = profile?.risk_appetite
    ? profile.risk_appetite === "high"
      ? "Aggressive"
      : profile.risk_appetite === "med-high"
        ? "Mod. Aggressive"
        : profile.risk_appetite === "med-low"
          ? "Mod. Conservative"
          : "Conservative"
    : "Virtual";

  return (
    <div className="relative min-h-screen text-foreground">
      {/* Subtle backdrop */}
      <div aria-hidden className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 grid-bg opacity-[0.12]" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-30 bg-gradient-primary" />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20"
          style={{ background: "var(--gold)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.14_0.03_250/0.6)_100%)]" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-[260px] flex-col gap-6 border-r border-border/60 bg-card/30 backdrop-blur-xl px-4 py-6">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Market<span className="text-gradient">IQ</span>
            </span>
          </Link>

          <div className="px-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl glass">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{userName}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  {riskProfile}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-1">
            {nav.map((n) => {
              const active = isActive(n.to, n.exact);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-card border border-primary/30 shadow-glow"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className={`relative w-4 h-4 ${active ? "text-primary" : ""}`} />
                  <span className="relative">{n.label}</span>
                  {active && <ChevronRight className="relative w-3.5 h-3.5 ml-auto text-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 space-y-2">
            <div className="rounded-2xl p-4 bg-gradient-card border border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] animate-pulse-dot" />
                Market open
              </div>
              <div className="mt-2 font-display text-2xl font-semibold tabular-nums">
                {time.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="text-[10px] text-muted-foreground">NSE · IST</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-card/50 transition w-full"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/60">
            <div className="flex items-center gap-3 px-4 sm:px-8 py-4">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono uppercase tracking-wider text-[10px]">Workspace</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{current}</span>
              </div>
              <div ref={searchRef} className="flex-1 max-w-xl mx-auto relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search RELIANCE, INFY, HDFCBANK…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearch(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchResults.length > 0) {
                      navigate({ to: `/app/analyze/${searchResults[0].ticker}` });
                      setShowSearch(false);
                      setSearchQuery("");
                    }
                  }}
                  className="w-full bg-card/40 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)] transition"
                />
                <AnimatePresence>
                  {showSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-card border border-border/60 shadow-xl overflow-hidden z-50"
                    >
                      {searchResults.map((r) => (
                        <button
                          key={r.ticker}
                          onClick={() => {
                            navigate({ to: `/app/analyze/${r.ticker}` });
                            setShowSearch(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-card/60 transition text-left"
                        >
                          <span className="font-mono text-xs text-primary">{r.ticker}</span>
                          <span className="text-muted-foreground">{r.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() =>
                    toast.info("No new notifications. We'll alert you when there's an update.")
                  }
                  className="relative w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-card/60 transition"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse-dot" />
                </button>
                <button
                  onClick={() => navigate({ to: "/app/settings" })}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-card/60 transition"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <Link
                  to="/app/onboarding"
                  className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl shadow-glow hover:opacity-90 transition"
                >
                  Retake quiz
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={loc.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
            {loc.pathname !== "/app/onboarding" && loc.pathname !== "/app/settings" && <DisclosureFooter />}
          </main>
        </div>
      </div>
    </div>
  );
}
