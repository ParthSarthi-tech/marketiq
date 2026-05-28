import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let idx = 0;

  text.replace(re, (match, _t3, boldItalic, _t2, bold, _t1, italic, offset) => {
    if (offset > last) {
      parts.push(<span key={idx++}>{text.slice(last, offset)}</span>);
    }
    if (boldItalic) {
      parts.push(<em key={idx++} style={{ fontStyle: "italic", fontWeight: 700 }}>{boldItalic}</em>);
    } else if (bold) {
      parts.push(<strong key={idx++}>{bold}</strong>);
    } else if (italic) {
      parts.push(<em key={idx++}>{italic}</em>);
    }
    last = offset + match.length;
    return match;
  });

  if (last < text.length) {
    parts.push(<span key={idx++}>{text.slice(last)}</span>);
  }

  return parts.length ? parts : [<span key={0}>{text}</span>];
}

function parseParagraph(line: string): ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith("- ")) {
    return (
      <li className="flex items-start gap-2">
        <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bull)" }} />
        <span>{parseInline(trimmed.slice(2))}</span>
      </li>
    );
  }
  if (/^\d+\.\s/.test(trimmed)) {
    return (
      <li className="flex items-start gap-2">
        <span className="font-mono text-xs shrink-0" style={{ color: "var(--bull)" }}>{trimmed.match(/^\d+/)?.[0]}.</span>
        <span>{parseInline(trimmed.replace(/^\d+\.\s/, ""))}</span>
      </li>
    );
  }
  if (/^#{1,3}\s/.test(trimmed)) {
    const level = trimmed.match(/^#+/)?.[0].length || 1;
    const text = trimmed.replace(/^#+\s/, "");
    const Tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
    return <Tag className="font-semibold mt-3 mb-1">{parseInline(text)}</Tag>;
  }
  if (trimmed.startsWith("|")) {
    return <span className="text-xs font-mono text-muted-foreground">{trimmed}</span>;
  }
  return <p>{parseInline(trimmed)}</p>;
}

function formatAI(text: string): ReactNode[] {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let inList = false;
  let listItems: ReactNode[] = [];
  let idx = 0;

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`list-${idx++}`} className="space-y-1 my-2">
          {listItems}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const isListItem = trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed);

    if (isListItem) {
      inList = true;
      listItems.push(parseParagraph(line));
    } else {
      flushList();
      if (trimmed === "") {
        blocks.push(<div key={`gap-${idx++}`} className="h-2" />);
      } else {
        blocks.push(
          <div key={`p-${idx++}`}>
            {parseParagraph(line)}
          </div>,
        );
      }
    }
  }
  flushList();

  return blocks;
}

function useTypewriter(text: string, speed = 18, enabled: boolean) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }
    indexRef.current = 0;
    setDisplayed("");

    timerRef.current = setTimeout(() => {
      const tick = () => {
        if (indexRef.current < text.length) {
          indexRef.current += Math.min(3, text.length - indexRef.current);
          setDisplayed(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed);
        }
      };
      tick();
    }, 200);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed, enabled]);

  return displayed;
}

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
  isLatest: boolean;
}

export function ChatMessage({ role, content, isLatest }: ChatMessageProps) {
  const enableReveal = role === "ai" && isLatest && content.length > 20;
  const revealedText = useTypewriter(content, 15, enableReveal);
  const displayText = enableReveal ? revealedText : content;

  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gradient-primary text-primary-foreground rounded-tr-sm shadow-glow">
          {content}
        </div>
      </motion.div>
    );
  }

  const isPartial = enableReveal && revealedText.length < content.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.25 0.04 160 / 0.4), oklch(0.2 0.02 150 / 0.35))",
          border: "1px solid oklch(0.78 0.18 155 / 0.25)",
          boxShadow: "0 0 24px oklch(0.78 0.18 155 / 0.08), inset 0 0 40px oklch(0.78 0.18 155 / 0.04)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.78 0.18 155 / 0.12)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--bull)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--bull)" }}>
              Advisor
            </span>
          </div>
          <div className="text-foreground/90 space-y-0.5">
            {formatAI(displayText)}
            {isPartial && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1.5 h-4 ml-0.5 rounded-sm align-text-bottom"
                style={{ background: "var(--bull)" }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
