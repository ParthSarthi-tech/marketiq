import { useState, useCallback, useRef } from "react";
import { chatWithAI } from "@/lib/ai-proxy";
import { buildSystemPrompt } from "@/lib/ai";
import type { QuizResponse, Portfolio } from "@/lib/supabase";
import type { PortfolioHolding } from "./usePortfolio";

interface Message {
  role: "user" | "ai";
  content: string;
  ts: number;
}

interface AIContextInput {
  userProfile: QuizResponse | null;
  portfolio: PortfolioHolding[];
  portfolioValue: number;
  cashBalance: number;
}

export function useAI(context: () => AIContextInput) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your MarketIQ advisor. Ask me about stocks, portfolio analysis, or investment strategies.", ts: Date.now() },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: Message = { role: "user", content, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const ctx = context();
        const systemPrompt = buildSystemPrompt({
          userProfile: ctx.userProfile,
          portfolio: ctx.portfolio,
          portfolioValue: ctx.portfolioValue,
          cashBalance: ctx.cashBalance,
        });

        const history = messagesRef.current.map((m) => ({
          role: (m.role === "user" ? "user" : "model") as "user" | "model",
          content: m.content,
        }));

        const result = await chatWithAI({
          data: { message: content, systemPrompt, history },
        });

        if (result.error) {
          const errorMsg: Message = {
            role: "ai",
            content: result.error,
            ts: Date.now(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } else {
          const aiMsg: Message = { role: "ai", content: result.text || "", ts: Date.now() };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch (error) {
        console.error("AI Error:", error);
        const errorMsg: Message = {
          role: "ai",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [context]
  );

  const clearChat = useCallback(() => {
    setMessages([
      { role: "ai", content: "Hi! I'm your MarketIQ advisor. Ask me about stocks, portfolio analysis, or investment strategies.", ts: Date.now() },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}