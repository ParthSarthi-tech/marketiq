import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 mt-4">
        <nav className="glass rounded-full px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Market<span className="text-gradient">IQ</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link
              to="/features"
              className="hover:text-foreground transition"
              activeProps={{ className: "text-foreground" }}
            >
              Features
            </Link>
            <Link
              to="/ai-advisor"
              className="hover:text-foreground transition"
              activeProps={{ className: "text-foreground" }}
            >
              AI Advisor
            </Link>
            <Link
              to="/learn"
              className="hover:text-foreground transition"
              activeProps={{ className: "text-foreground" }}
            >
              Learn
            </Link>
            <Link
              to="/how-it-works"
              className="hover:text-foreground transition"
              activeProps={{ className: "text-foreground" }}
            >
              How it works
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {!loading &&
              (isAuthenticated ? (
                <Link
                  to="/app"
                  className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition shadow-glow"
                >
                  Open App
                </Link>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-4 py-2 transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition shadow-glow"
                  >
                    Get started
                  </Link>
                </>
              ))}
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
