import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-mono mb-2">{eyebrow}</div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, delta, trend = "up", spark }: { label: string; value: ReactNode; delta?: string; trend?: "up" | "down"; spark?: number[] }) {
  const positive = trend === "up";
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    rotateY.set(((x - midX) / midX) * 6);
    rotateX.set(((midY - y) / midY) * 6);
    ref.current.style.setProperty("--mx", `${x}px`);
    ref.current.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
      className="relative rounded-2xl p-5 bg-gradient-card border border-border/60 overflow-hidden group cursor-default"
    >
      <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="font-display text-3xl font-semibold tabular-nums shimmer-value">{value}</div>
        {delta && (
          <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${positive ? "text-[var(--bull)] bg-[var(--bull)]/10" : "text-[var(--bear)] bg-[var(--bear)]/10"}`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      {spark && <Sparkline values={spark} positive={positive} />}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition" style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), oklch(0.78 0.18 155 / 0.08), transparent 40%)" }} />
    </motion.div>
  );
}

export function Sparkline({ values, positive = true }: { values: number[]; positive?: boolean }) {
  const w = 220, h = 48;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const stroke = positive ? "oklch(0.78 0.18 155)" : "oklch(0.65 0.24 25)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full h-12">
      <defs>
        <linearGradient id={`sg-${positive ? "u" : "d"}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${positive ? "u" : "d"}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${positive ? "u" : "d"})`} />
      <motion.polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        filter={`url(#glow-${positive ? "u" : "d"})`}
      />
    </svg>
  );
}

export function CountUp({ to, prefix = "", suffix = "", decimals = 0, duration = 1200 }: { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }) {
  const [v, setV] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(to * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span className="tabular-nums">
      {prefix}
      {v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
