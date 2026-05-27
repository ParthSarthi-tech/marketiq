import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/lib/stockData";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-card border border-border/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-card/30 transition cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Score Breakdown
          </span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            {breakdown.summary}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 pb-4 space-y-3">
            {breakdown.factors.map((factor) => (
              <ScoreFactorRow key={factor.label} factor={factor} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ScoreFactorRow({ factor }: { factor: ScoreBreakdownType["factors"][number] }) {
  const barWidth = Math.min(
    100,
    Math.abs(factor.contribution) / Math.max(1, factor.maxContribution) * 100,
  );
  const barColor = factor.contribution > 0
    ? "var(--bull)"
    : factor.contribution < 0
      ? "var(--bear)"
      : "var(--gold)";

  return (
    <div className="rounded-xl bg-card/40 border border-border/40 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold">{factor.label}</span>
          <span className="text-[11px] font-mono text-muted-foreground">{factor.value}</span>
        </div>
        <span
          className="text-xs font-mono font-semibold tabular-nums shrink-0 ml-2"
          style={{ color: barColor }}
        >
          {factor.contribution > 0 ? "+" : ""}{factor.contribution}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-card/50 mb-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%`, backgroundColor: barColor, opacity: 0.7 }}
        />
      </div>

      <div className="flex items-start gap-1.5">
        {factor.contribution > 0 ? (
          <TrendingUp className="w-3 h-3 mt-0.5 shrink-0" style={{ color: barColor }} />
        ) : factor.contribution < 0 ? (
          <TrendingDown className="w-3 h-3 mt-0.5 shrink-0" style={{ color: barColor }} />
        ) : (
          <Minus className="w-3 h-3 mt-0.5 shrink-0" style={{ color: barColor }} />
        )}
        <span className="text-[11px] text-muted-foreground leading-relaxed">{factor.detail}</span>
      </div>
    </div>
  );
}
