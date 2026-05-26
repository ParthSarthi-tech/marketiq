import { createServerFn } from "@tanstack/react-start";

interface ChatPayload {
  message: string;
  systemPrompt?: string;
  history: Array<{ role: "user" | "model"; content: string }>;
}

interface ChatResult {
  text?: string;
  error?: string;
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

async function trySendMessage(
  apiKey: string,
  contents: unknown[],
  modelIndex: number,
  systemInstruction?: { parts: { text: string }[] },
): Promise<{ text?: string; error?: string }> {
  if (modelIndex >= GEMINI_MODELS.length) {
    return { error: "All AI models failed. Please try again later." };
  }

  const model = GEMINI_MODELS[modelIndex];
  try {
    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.system_instruction = systemInstruction;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (response.status === 404 || response.status === 429) {
      return trySendMessage(apiKey, contents, modelIndex + 1, systemInstruction);
    }

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
    return trySendMessage(apiKey, contents, modelIndex + 1, systemInstruction);
  }
}

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as ChatPayload)
  .handler(async (ctx): Promise<ChatResult> => {
    try {
      const { message, systemPrompt, history } = ctx.data;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return {
          error: "AI service is not configured. Please set GEMINI_API_KEY in your environment.",
        };
      }

      const systemInstruction = systemPrompt
        ? { parts: [{ text: systemPrompt }] as { text: string }[] }
        : undefined;

      const contents = [
        ...history.map((m) => ({
          role: (m.role === "user" ? "user" : "model") as "user" | "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      return await trySendMessage(apiKey, contents, 0, systemInstruction);
    } catch (err) {
      console.error("[AIProxy] Unhandled handler error:", err);
      return { error: "AI service encountered an internal error. Please try again." };
    }
  });
