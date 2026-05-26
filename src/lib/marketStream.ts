import { isMarketOpen, getWebSocketAuthUrl } from "./upstox";

const UPSTOX_TOKEN = import.meta.env.VITE_UPSTOX_ACCESS_TOKEN;

export interface TickData {
  symbol: string;
  instrumentKey: string;
  ltp: number;
  closePrice: number;
  change: number;
  changePercent: number;
  timestamp: number;
  volume: number;
}

export interface MarketInfo {
  NSE_EQ?: string;
  NSE_FO?: string;
  BSE_EQ?: string;
  [key: string]: string | undefined;
}

type TickCallback = (data: Record<string, TickData>) => void;
type StatusCallback = (info: MarketInfo | null) => void;

class MarketStream {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribedKeys: Set<string> = new Set();
  private tickCallbacks: Set<TickCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private lastPrices: Record<string, { ltp: number; cp: number }> = {};
  private isConnecting = false;

  async connect(onTick: TickCallback, onStatus: StatusCallback): Promise<void> {
    this.tickCallbacks.add(onTick);
    this.statusCallbacks.add(onStatus);

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    await this.connectInternal();
  }

  private handleMessage(message: Record<string, unknown>): void {
    const type = message.type as string;

    if (type === "market_info") {
      const marketInfo = message.marketInfo as { segmentStatus?: MarketInfo };
      const segmentStatus = marketInfo?.segmentStatus || {};
      this.statusCallbacks.forEach((cb) => cb(segmentStatus));
      return;
    }

    if (type === "live_feed") {
      const feeds = (message.feeds as Record<string, unknown>) || {};
      const ticks: Record<string, TickData> = {};

      for (const [instrumentKey, feed] of Object.entries(feeds)) {
        const feedData = feed as { ltpc?: { ltp: number; ltt: string; ltq: string; cp: number } };
        const ltpc = feedData.ltpc;

        if (!ltpc) continue;

        const ltp = ltpc.ltp;
        const cp = ltpc.cp;
        const change = cp ? ltp - cp : 0;
        const changePercent = cp ? (change / cp) * 100 : 0;

        this.lastPrices[instrumentKey] = { ltp, cp };

        const symbol = this.extractSymbol(instrumentKey);

        ticks[instrumentKey] = {
          symbol,
          instrumentKey,
          ltp,
          closePrice: cp,
          change,
          changePercent,
          timestamp: parseInt(ltpc.ltt) || Date.now(),
          volume: parseInt(ltpc.ltq) || 0,
        };
      }

      if (Object.keys(ticks).length > 0) {
        this.tickCallbacks.forEach((cb) => cb(ticks));
      }
    }
  }

  private extractSymbol(key: string): string {
    if (key.startsWith("NSE_INDEX|")) {
      return `INDEX:${key.replace("NSE_INDEX|", "")}`;
    }
    const parts = key.split("|");
    return parts[parts.length - 1];
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[MarketStream] Max reconnect attempts reached");
      this.tickCallbacks.clear();
      this.statusCallbacks.clear();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => {
      this.connectInternal();
    }, delay);
  }

  private async connectInternal(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    const authUrl = await getWebSocketAuthUrl();

    if (!authUrl) {
      console.error("[MarketStream] Failed to get authorized URL");
      this.isConnecting = false;
      return;
    }

    this.ws = new WebSocket(authUrl);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      if (this.subscribedKeys.size > 0) {
        this.resubscribe();
      }
    };

    this.ws.onmessage = async (event) => {
      try {
        let data: string;
        const isBlob = event.data instanceof Blob;

        if (isBlob) {
          data = await (event.data as Blob).text();
        } else if (event.data instanceof ArrayBuffer) {
          data = new TextDecoder().decode(event.data);
        } else {
          data = event.data;
        }

        data = data.trim();

        if (data.length === 0) {
          return;
        }

        if (data.startsWith("{") || data.startsWith("[")) {
          const message = JSON.parse(data);
          this.handleMessage(message);
        }
      } catch (e) {
        console.error("[MarketStream] Failed to parse message:", e);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[MarketStream] WebSocket error:", error);
      this.isConnecting = false;
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.handleDisconnect();
    };
  }

  subscribe(instrumentKeys: string[]): void {
    for (const key of instrumentKeys) {
      this.subscribedKeys.add(key);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(instrumentKeys, "ltpc");
    }
  }

  private resubscribe(): void {
    this.sendSubscribe(Array.from(this.subscribedKeys), "ltpc");
  }

  private sendSubscribe(keys: string[], mode: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const request = {
      guid: `sub_${Date.now()}`,
      method: "sub",
      data: {
        mode,
        instrumentKeys: keys,
      },
    };

    this.ws.send(JSON.stringify(request));
  }

  unsubscribe(instrumentKeys: string[]): void {
    for (const key of instrumentKeys) {
      this.subscribedKeys.delete(key);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      const request = {
        guid: `unsub_${Date.now()}`,
        method: "unsub",
        data: {
          instrumentKeys,
        },
      };
      this.ws.send(JSON.stringify(request));
    }
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedKeys.clear();
    this.lastPrices = {};
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  removeTickCallback(cb: TickCallback): void {
    this.tickCallbacks.delete(cb);
  }

  removeStatusCallback(cb: StatusCallback): void {
    this.statusCallbacks.delete(cb);
  }
}

let streamInstance: MarketStream | null = null;

export function getMarketStream(): MarketStream {
  if (!streamInstance) {
    streamInstance = new MarketStream();
  }
  return streamInstance;
}

export function subscribeToStocks(
  instrumentKeys: string[],
  onTick: (data: Record<string, TickData>) => void,
  onStatus?: (info: MarketInfo | null) => void,
): () => void {
  const stream = getMarketStream();

  stream.connect(onTick, onStatus || (() => {}));

  stream.subscribe(instrumentKeys);

  return () => {
    stream.unsubscribe(instrumentKeys);
    stream.removeTickCallback(onTick);
    if (onStatus) stream.removeStatusCallback(onStatus);
  };
}
