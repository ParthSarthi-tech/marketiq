import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, RotateCcw, Brain, Target, Wallet, Sparkles,
  TrendingUp, Check, ArrowRight, BarChart3, ShieldCheck, MousePointer2, Plus, Minus,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── *
 *  Auto-playing reel — only starts when scrolled into view.
 *  5 acts with live cursor interactions, longer dwell, richer descriptions.
 * ────────────────────────────────────────────────────────────────────────── */

type Scene = {
  id: string;
  label: string;
  blurb: string;
  duration: number; // ms
  Icon: typeof Brain;
};

const SCENES: Scene[] = [
  { id: "quiz",      label: "The 2-min quiz",     blurb: "Three questions capture your income, risk and horizon — no jargon, no forms.", duration: 7000, Icon: Target },
  { id: "ai",        label: "AI matches you",     blurb: "Our model cross-references 4,200 NSE & BSE tickers against 38 signals in real time.", duration: 7200, Icon: Brain },
  { id: "pick",      label: "Hand-picked stocks", blurb: "Watch the cursor add winners to your basket — set the quantity, lock the entry.", duration: 7800, Icon: Sparkles },
  { id: "portfolio", label: "Virtual portfolio",  blurb: "Allocations rebalance instantly. Zero real money, full market exposure.", duration: 7000, Icon: Wallet },
  { id: "growth",    label: "Watch it grow",      blurb: "90 days later — every trade reviewed by AI, every lesson saved to your journal.", duration: 6800, Icon: TrendingUp },
];

export function HowItWorksReel() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(performance.now());
  const rafRef = useRef<number>(0);

  // Trigger play only when reel scrolls into view (the first time)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          setPlaying(true);
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasStarted]);

  // Pause when scrolled out of view (after it has started)
  useEffect(() => {
    if (!hasStarted) return;
    setPlaying(inView);
  }, [inView, hasStarted]);

  // smooth RAF-driven progress + scene advance
  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now() - progress * SCENES[active].duration;
    const tick = (t: number) => {
      const elapsed = t - startRef.current;
      const dur = SCENES[active].duration;
      const p = Math.min(elapsed / dur, 1);
      setProgress(p);
      if (p >= 1) {
        setActive((a) => (a + 1) % SCENES.length);
        setProgress(0);
        startRef.current = performance.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active]);

  const jump = (i: number) => {
    setActive(i);
    setProgress(0);
    startRef.current = performance.now();
  };

  const restart = () => {
    setActive(0);
    setProgress(0);
    startRef.current = performance.now();
    setPlaying(true);
  };

  return (
    <section id="how-it-works" ref={containerRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.15] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-bull opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-bull" />
            </span>
            <span className="text-muted-foreground font-mono uppercase tracking-widest">
              Watch how it works
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1]">
            From <span className="text-gradient">zero to invested</span> in 5 acts
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            A live, 45-second walkthrough — quiz, AI match, cursor-driven stock picks, virtual portfolio, growth.
          </p>
        </motion.div>

        {/* Player frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/20 to-bull/20 blur-2xl opacity-60 pointer-events-none" />

          <div className="relative glass rounded-3xl overflow-hidden shadow-elegant border border-border">
            {/* Player chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/40">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-bear/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gold/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-bull/70" />
                </div>
                <span className="ml-3 text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                  marketiq.reel · {hasStarted ? "live preview" : "ready · scroll into view"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span className="hidden sm:inline">{String(active + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}</span>
                <button
                  onClick={() => { setHasStarted(true); setPlaying((p) => !p); }}
                  className="p-1.5 rounded-full hover:bg-card/80 transition"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={restart}
                  className="p-1.5 rounded-full hover:bg-card/80 transition"
                  aria-label="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-background via-background to-card/40 overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <motion.div
                key={`wash-${active}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    [
                      "radial-gradient(ellipse at 20% 30%, oklch(0.78 0.18 155 / 0.12), transparent 60%)",
                      "radial-gradient(ellipse at 80% 20%, oklch(0.65 0.22 270 / 0.16), transparent 60%)",
                      "radial-gradient(ellipse at 50% 50%, oklch(0.85 0.16 90 / 0.12), transparent 60%)",
                      "radial-gradient(ellipse at 30% 80%, oklch(0.78 0.18 155 / 0.14), transparent 60%)",
                      "radial-gradient(ellipse at 70% 70%, oklch(0.85 0.16 90 / 0.18), transparent 60%)",
                    ][active],
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={SCENES[active].id}
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center p-6 md:p-10"
                >
                  {active === 0 && <SceneQuiz playing={playing} />}
                  {active === 1 && <SceneAI />}
                  {active === 2 && <ScenePick playing={playing} />}
                  {active === 3 && <ScenePortfolio />}
                  {active === 4 && <SceneGrowth />}
                </motion.div>
              </AnimatePresence>

              {/* Caption + blurb */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
                <motion.div
                  key={`cap-${active}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="glass rounded-2xl px-3 py-2 max-w-md"
                >
                  <div className="flex items-center gap-2 text-xs">
                    {(() => {
                      const Icon = SCENES[active].Icon;
                      return <Icon className="w-3.5 h-3.5 text-accent" />;
                    })()}
                    <span className="font-mono uppercase tracking-widest text-muted-foreground">
                      Act {active + 1}
                    </span>
                    <span className="text-foreground">· {SCENES[active].label}</span>
                  </div>
                  <p className="mt-1 text-[11px] md:text-xs text-muted-foreground leading-snug hidden sm:block">
                    {SCENES[active].blurb}
                  </p>
                </motion.div>
                <div className="hidden md:flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-[10px] font-mono text-muted-foreground shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse-dot" />
                  REC · 60FPS · 1080p
                </div>
              </div>

              {/* Idle overlay when reel hasn't started */}
              {!hasStarted && (
                <button
                  onClick={() => { setHasStarted(true); setPlaying(true); }}
                  className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm group"
                >
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-primary text-primary-foreground shadow-glow group-hover:scale-105 transition">
                    <Play className="w-4 h-4" />
                    <span className="font-mono text-sm uppercase tracking-widest">Start the reel</span>
                  </div>
                </button>
              )}
            </div>

            {/* Progress + scene markers */}
            <div className="px-5 py-4 border-t border-border bg-card/30">
              <div className="relative h-1 rounded-full bg-secondary overflow-hidden mb-3">
                <div className="absolute inset-0 flex">
                  {SCENES.map((s, i) => (
                    <div
                      key={s.id}
                      className="h-full border-r border-background/40 last:border-r-0 relative overflow-hidden"
                      style={{ width: `${100 / SCENES.length}%` }}
                    >
                      <div
                        className="h-full bg-gradient-primary"
                        style={{
                          width:
                            i < active ? "100%" : i === active ? `${progress * 100}%` : "0%",
                          transition: i === active ? "none" : "width 0.3s ease",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                {SCENES.map((s, i) => {
                  const Icon = s.Icon;
                  const isActive = i === active;
                  return (
                    <button
                      key={s.id}
                      onClick={() => jump(i)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
                        isActive
                          ? "bg-gradient-primary text-primary-foreground shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Animated cursor ───────────────────────── */

function Cursor({
  steps,
  playing,
}: {
  steps: { x: string; y: string; t: number; click?: boolean }[];
  playing: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (!playing) return;
    setIdx(0);
    setClicked(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          setIdx(i);
          if (s.click) {
            setClicked(true);
            timers.push(setTimeout(() => setClicked(false), 320));
          }
        }, s.t)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [steps, playing]);

  const s = steps[idx];
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ left: s.x, top: s.y }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{ left: steps[0].x, top: steps[0].y }}
    >
      <div className="relative">
        <MousePointer2 className="w-5 h-5 text-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] fill-foreground/90" />
        <AnimatePresence>
          {clicked && (
            <motion.span
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute -top-1 -left-1 w-7 h-7 rounded-full border-2 border-accent"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Scenes ───────────────────────── */

function SceneQuiz({ playing }: { playing: boolean }) {
  const questions = [
    { q: "Monthly income?", a: "₹85,000", pct: 64, hint: "Salary + side hustle" },
    { q: "Risk appetite?",  a: "Balanced", pct: 55, hint: "Some ups, some downs" },
    { q: "Time horizon?",   a: "5+ years", pct: 80, hint: "Long-term wealth" },
  ];
  // cursor taps each card sequentially
  const cursorSteps = [
    { x: "8%",  y: "85%", t: 0 },
    { x: "20%", y: "55%", t: 400, click: true },
    { x: "50%", y: "55%", t: 2200, click: true },
    { x: "80%", y: "55%", t: 4000, click: true },
    { x: "50%", y: "92%", t: 6000 },
  ];
  return (
    <div className="w-full max-w-3xl relative">
      <Cursor steps={cursorSteps} playing={playing} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questions.map((it, i) => (
          <motion.div
            key={it.q}
            initial={{ opacity: 0, y: 30, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: i * 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Q0{i + 1} · {it.hint}
            </div>
            <div className="text-sm text-muted-foreground mb-3">{it.q}</div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.6 + 1.6 }}
              className="font-display font-bold text-2xl"
            >
              {it.a}
            </motion.div>
            <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${it.pct}%` }}
                transition={{ delay: i * 0.6 + 1.4, duration: 1.1, ease: "easeOut" }}
                className="h-full bg-gradient-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5.6, duration: 0.6 }}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-accent font-mono"
      >
        <Check className="w-4 h-4" /> Profile captured · 12 seconds · ready for AI
      </motion.div>
    </div>
  );
}

function SceneAI() {
  const tags = ["IT", "Energy", "Pharma", "Banking", "FMCG", "Auto", "Metals", "Realty"];
  const signals = [
    "Scanning P/E ratios across NIFTY 500…",
    "Weighing momentum + earnings revisions…",
    "Filtering for your balanced risk band…",
    "Locking 3 high-conviction matches.",
  ];
  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <div className="relative w-44 h-44">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dashed border-accent/40"
        />
        <div className="absolute inset-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
          <Brain className="w-12 h-12 text-primary-foreground" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
        {tags.map((t, i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4 + i * 0.18, duration: 0.5 }}
            className="px-3 py-1.5 rounded-full glass text-xs font-mono"
          >
            {t}
          </motion.span>
        ))}
      </div>

      {/* Rolling signal log */}
      <div className="mt-5 h-5 overflow-hidden text-xs font-mono text-muted-foreground">
        <AnimatePresence mode="wait">
          {signals.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ delay: 1.6 + i * 1.6, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" /> {s}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScenePick({ playing }: { playing: boolean }) {
  const picks = [
    { sym: "RELIANCE",  name: "Reliance Industries",  chg: "+2.4%", score: 96, sector: "Energy", price: 2840, qty: 5 },
    { sym: "TCS",       name: "Tata Consultancy",     chg: "+1.8%", score: 92, sector: "IT",     price: 3920, qty: 3 },
    { sym: "SUNPHARMA", name: "Sun Pharmaceutical",   chg: "+1.6%", score: 88, sector: "Pharma", price: 1480, qty: 4 },
  ];

  // cursor choreography — hover each card, click +, click +, click Add
  const cursorSteps = [
    { x: "5%",  y: "92%", t: 0 },
    { x: "78%", y: "26%", t: 400 },                 // hover row 1 qty area
    { x: "78%", y: "26%", t: 900, click: true },    // +
    { x: "78%", y: "26%", t: 1400, click: true },   // +
    { x: "92%", y: "26%", t: 1900, click: true },   // Add to basket
    { x: "78%", y: "52%", t: 3200 },                // row 2
    { x: "78%", y: "52%", t: 3700, click: true },
    { x: "92%", y: "52%", t: 4400, click: true },
    { x: "78%", y: "78%", t: 5800 },                // row 3
    { x: "78%", y: "78%", t: 6300, click: true },
    { x: "92%", y: "78%", t: 6900, click: true },
  ];

  return (
    <div className="w-full max-w-2xl space-y-3 relative">
      <Cursor steps={cursorSteps} playing={playing} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          Matched for you · tap + to size your position
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          Basket · <BasketCount picks={picks} playing={playing} /> stocks
        </div>
      </div>
      {picks.map((m, i) => (
        <PickRow key={m.sym} stock={m} index={i} playing={playing} />
      ))}
    </div>
  );
}

function BasketCount({ picks, playing }: { picks: { sym: string }[]; playing: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!playing) return;
    setN(0);
    const t1 = setTimeout(() => setN(1), 2100);
    const t2 = setTimeout(() => setN(2), 4600);
    const t3 = setTimeout(() => setN(3), 7100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [playing, picks.length]);
  return <span className="text-foreground font-semibold">{n}</span>;
}

function PickRow({
  stock, index, playing,
}: {
  stock: { sym: string; name: string; chg: string; score: number; sector: string; price: number; qty: number };
  index: number;
  playing: boolean;
}) {
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);
  const rowDelay = index * 2500; // each row's interactions begin staggered

  useEffect(() => {
    if (!playing) return;
    setQty(0); setAdded(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setQty(1), rowDelay + 900));
    timers.push(setTimeout(() => setQty(stock.qty), rowDelay + 1400));
    timers.push(setTimeout(() => setAdded(true), rowDelay + 1950));
    return () => timers.forEach(clearTimeout);
  }, [playing, rowDelay, stock.qty]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ delay: index * 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, x: 4 }}
      className={`flex items-center gap-3 p-3.5 rounded-2xl glass border transition ${
        added ? "border-bull/60 shadow-glow" : "border-border"
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
        <span className="font-mono font-bold text-xs text-primary-foreground">
          {stock.sym.slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">{stock.sym}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            {stock.sector}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{stock.score}% match</span>
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {stock.name} · ₹{stock.price.toLocaleString("en-IN")} ·{" "}
          <span style={{ color: "var(--bull)" }}>{stock.chg}</span>
        </div>
      </div>

      {/* qty stepper */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/60 border border-border">
        <Minus className="w-3 h-3 text-muted-foreground" />
        <motion.span
          key={qty}
          initial={{ scale: 1.4, color: "var(--accent)" }}
          animate={{ scale: 1, color: "var(--foreground)" }}
          transition={{ duration: 0.25 }}
          className="font-mono text-sm w-5 text-center"
        >
          {qty}
        </motion.span>
        <Plus className="w-3 h-3 text-accent" />
      </div>

      {/* Add button */}
      <motion.div
        animate={added ? { scale: [1, 0.92, 1] } : {}}
        transition={{ duration: 0.35 }}
        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-1 ${
          added
            ? "bg-bull/20 text-bull"
            : "bg-gradient-primary text-primary-foreground"
        }`}
      >
        {added ? <><Check className="w-3 h-3" /> Added</> : <>Add ₹{(qty * stock.price).toLocaleString("en-IN") || "0"}</>}
      </motion.div>
    </motion.div>
  );
}

function ScenePortfolio() {
  const allocations = [
    { name: "RELIANCE", pct: 32, color: "oklch(0.78 0.18 155)" },
    { name: "TCS",      pct: 28, color: "oklch(0.65 0.22 270)" },
    { name: "SUNPHARMA",pct: 22, color: "oklch(0.85 0.16 90)" },
    { name: "Cash",     pct: 18, color: "oklch(0.55 0.05 250)" },
  ];
  let acc = 0;
  return (
    <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-center">
      <div className="relative w-56 h-56 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" stroke="oklch(0.22 0.02 250)" strokeWidth="10" fill="none" />
          {allocations.map((a, i) => {
            const C = 2 * Math.PI * 42;
            const dash = (a.pct / 100) * C;
            const offset = -((acc / 100) * C);
            acc += a.pct;
            return (
              <motion.circle
                key={a.name}
                cx="50" cy="50" r="42" fill="none"
                stroke={a.color}
                strokeWidth="10"
                strokeDasharray={`${dash} ${C}`}
                strokeDashoffset={offset}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 1.1, ease: "easeOut" }}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Virtual</div>
          <div className="font-display font-bold text-2xl">₹50,000</div>
          <div className="text-xs text-bull font-mono">+ ₹3,420 today</div>
        </div>
      </div>

      <div className="space-y-3">
        {allocations.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.25 }}
            className="flex items-center gap-3 glass rounded-xl px-3 py-2"
          >
            <span className="w-3 h-3 rounded-sm" style={{ background: a.color }} />
            <span className="font-mono text-sm flex-1">{a.name}</span>
            <span className="font-mono text-sm text-muted-foreground">{a.pct}%</span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="flex items-center gap-2 text-xs text-muted-foreground pt-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-bull" />
          Diversified across 3 sectors · 18% cash buffer
        </motion.div>
      </div>
    </div>
  );
}

function SceneGrowth() {
  const path = "M0,170 Q60,150 120,130 T240,90 T360,30 L360,200 L0,200 Z";
  const line = "M0,170 Q60,150 120,130 T240,90 T360,30";
  return (
    <div className="w-full max-w-3xl">
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              90-day virtual return · reviewed daily by AI
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-display font-bold text-3xl"
            >
              <CountUp from={50000} to={61840} />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="px-3 py-1.5 rounded-full bg-bull/15 text-bull font-mono text-sm flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" /> +23.7%
          </motion.div>
        </div>

        <svg viewBox="0 0 360 200" className="w-full h-44">
          <defs>
            <linearGradient id="growArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={path}
            fill="url(#growArea)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.2 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="oklch(0.78 0.18 155)"
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.circle
            cx="360" cy="30" r="5"
            fill="oklch(0.85 0.16 90)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4 }}
          className="mt-4 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <BarChart3 className="w-3.5 h-3.5 text-accent" /> Sharpe 1.84
          </div>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-bull" /> Drawdown 4.2%
          </div>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-accent" /> 14 AI lessons saved
          </div>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1 ml-auto">
            <span className="text-muted-foreground">Ready when you are</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CountUp({ from, to, duration = 2200 }: { from: number; to: number; duration?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return <>₹{v.toLocaleString("en-IN")}</>;
}
