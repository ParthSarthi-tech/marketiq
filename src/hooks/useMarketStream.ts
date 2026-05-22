import { useEffect, useRef, useState, useCallback } from "react";
import { getWebSocketAuthUrl } from "@/lib/upstox";

export interface StreamQuote {
  symbol: string;
  instrumentKey: string;
  ltp: number;
  ltt: number;
  ltq: number;
  cp: number;
  change: number;
  changePercent: number;
}

interface UseMarketStreamOptions {
  instrumentKeys: string[];
  enabled?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export function useMarketStream({
  instrumentKeys,
  enabled = true,
  onConnectionChange,
}: UseMarketStreamOptions) {
  const [quotes, setQuotes] = useState<Map<string, StreamQuote>>(new Map());
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = () => Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

  const updateQuote = useCallback((key: string, ltp: number, ltt: number, ltq: number, cp: number) => {
    const change = cp ? ltp - cp : 0;
    const changePercent = cp ? (change / cp) * 100 : 0;

    const symbol = key.startsWith("NSE_INDEX|")
      ? key.replace("NSE_INDEX|", "INDEX:")
      : key.split("|")[1] || key;

    setQuotes((prev) => {
      const next = new Map(prev);
      next.set(key, { symbol, instrumentKey: key, ltp, ltt, ltq, cp, change, changePercent });
      return next;
    });
  }, []);

  const subscribe = useCallback((ws: WebSocket) => {
    if (instrumentKeys.length === 0) return;

    const payload = {
      guid: `miq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      method: "sub",
      data: {
        mode: "ltpc",
        instrumentKeys: instrumentKeys,
      },
    };

    ws.send(JSON.stringify(payload));
  }, [instrumentKeys]);

  const connect = useCallback(async () => {
    if (!enabled || instrumentKeys.length === 0) return;
    if (connecting || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnecting(true);

    try {
      const wsUrl = await getWebSocketAuthUrl();
      if (!wsUrl) {
        console.error("[MarketStream] Failed to get WebSocket URL");
        setConnecting(false);
        scheduleReconnect();
        return;
      }

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[MarketStream] Connected");
        setConnected(true);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);
        subscribe(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "live_feed" && data.feeds) {
            for (const [key, feed] of Object.entries(data.feeds as Record<string, unknown>)) {
              const feedData = feed as Record<string, unknown>;
              const ltpc = feedData.ltpc as { ltp?: number; ltt?: number; ltq?: number; cp?: number } | undefined;
              if (ltpc?.ltp !== undefined) {
                updateQuote(key, ltpc.ltp, ltpc.ltt || 0, ltpc.ltq || 0, ltpc.cp || 0);
              }
            }
          }
        } catch (e) {
          // ignore parse errors for non-JSON messages (pings, etc.)
        }
      };

      ws.onerror = (error) => {
        console.error("[MarketStream] WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("[MarketStream] Connection closed");
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
        onConnectionChange?.(false);
        scheduleReconnect();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("[MarketStream] Connection error:", e);
      setConnecting(false);
      scheduleReconnect();
    }
  }, [enabled, instrumentKeys, connecting, subscribe, updateQuote, onConnectionChange]);

  const scheduleReconnect = useCallback(() => {
    if (!enabled) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn("[MarketStream] Max reconnect attempts reached");
      return;
    }

    const delay = reconnectDelay();
    console.log(`[MarketStream] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, delay);
  }, [enabled, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    if (enabled && instrumentKeys.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, JSON.stringify(instrumentKeys)]);

  const getQuote = useCallback(
    (instrumentKey: string): StreamQuote | undefined => {
      return quotes.get(instrumentKey);
    },
    [quotes]
  );

  const getAllQuotes = useCallback((): StreamQuote[] => {
    return Array.from(quotes.values());
  }, [quotes]);

  return {
    quotes,
    connected,
    connecting,
    getQuote,
    getAllQuotes,
    reconnect: connect,
    disconnect,
  };
}