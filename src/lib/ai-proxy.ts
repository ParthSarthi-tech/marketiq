import { createServerFn } from "@tanstack/react-start";

interface ChatPayload {
  message: string;
  systemPrompt: string;
  history: Array<{ role: "user" | "model"; content: string }>;
}

interface ChatResult {
  text?: string;
  error?: string;
}

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as ChatPayload)
  .handler(async (ctx): Promise<ChatResult> => {
    const { message, systemPrompt, history } = ctx.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { error: "AI service is not configured. Please set GEMINI_API_KEY in your environment." };
    }

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...history.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const msg = errorBody?.error?.message || `API returned status ${response.status}`;
        return { error: `AI request failed: ${msg}` };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return { error: "AI returned an empty response. Try rephrasing your question." };
      }

      return { text };
    } catch (err) {
      return { error: "Network error while contacting AI service. Please try again." };
    }
  });
