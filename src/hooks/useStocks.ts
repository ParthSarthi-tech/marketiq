import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getQuotesBatch,
  getStockQuote,
  searchInstruments,
  getIndexQuote,
  isMarketOpen as checkMarketOpen,
  type StockQuote,
  type InstrumentSearchResult,
} from "@/lib/upstox";
import { STOCK_CONFIG, INDIAN_STOCKS, INDEX_KEYS, getAllTickers } from "@/lib/stockMetadata";
import { resolveAllInstrumentKeys, getResolvedKey, resolveAnyKey } from "@/lib/instrumentResolver";
import { subscribeToStocks, type TickData, type MarketInfo } from "@/lib/marketStream";

export type { StockQuote, InstrumentSearchResult };

export function useStockQuote(symbol: string) {
  const [liveQuote, setLiveQuote] = useState<StockQuote | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const { data: initialQuote, isLoading } = useQuery({
    queryKey: ["upstox_quote", symbol],
    queryFn: async (): Promise<StockQuote | null> => {
      let key = getResolvedKey(symbol);
      if (!key) {
        key = await resolveAnyKey(symbol);
      }
      if (!key) return null;
      return getStockQuote(key, symbol);
    },
    enabled: !!symbol,
    staleTime: 30000,
    retry: 2,
  });

  const quote = liveQuote || initialQuote;

  useEffect(() => {
    if (!symbol) return;

    const fetchKey = async () => {
      let key = getResolvedKey(symbol);
      if (!key) {
        key = await resolveAnyKey(symbol);
      }
      return key;
    };

    fetchKey().then((key) => {
      if (!key) return;

      const unsubscribe = subscribeToStocks(
        [key],
        (ticks) => {
          const tick = ticks[key];
          if (tick) {
            setLiveQuote({
              symbol: tick.symbol,
              lastPrice: tick.ltp,
              change: tick.change,
              changePercent: tick.changePercent,
              open: tick.ltp,
              high: tick.ltp,
              low: tick.ltp,
              close: tick.closePrice,
              volume: tick.volume,
              timestamp: tick.timestamp,
              c: tick.ltp,
              d: tick.change,
              dp: tick.changePercent,
              h: tick.ltp,
              l: tick.ltp,
              o: tick.ltp,
              pc: tick.closePrice,
              v: tick.volume,
            });
            setWsConnected(true);
          }
        },
        () => {},
      );

      return unsubscribe;
    });
  }, [symbol]);

  return { data: quote, isLoading, wsConnected };
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ["upstox_search", query],
    queryFn: () => searchInstruments(query, "NSE"),
    enabled: query.length >= 1,
    staleTime: 60000,
  });
}

export function useNiftyQuote() {
  return useQuery({
    queryKey: ["nifty50"],
    queryFn: () => getIndexQuote(INDEX_KEYS.NIFTY_50),
    staleTime: 30000,
    retry: 2,
  });
}

export function useMarketStatus() {
  return useQuery({
    queryKey: ["market_status"],
    queryFn: () => checkMarketOpen(),
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

export function useIndianStocks() {
  const [liveQuotes, setLiveQuotes] = useState<
    Map<
      string,
      {
        c: number;
        d: number;
        dp: number;
        h: number;
        l: number;
        o: number;
        pc: number;
        v: number;
      }
    >
  >(new Map());

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["indianStocks"],
    queryFn: async () => {
      const tickers = Object.keys(STOCK_CONFIG);

      const keys = await resolveAllInstrumentKeys();

      const instrumentKeys = tickers.map((t) => getResolvedKey(t)).filter(Boolean) as string[];

      if (instrumentKeys.length === 0) {
        return INDIAN_STOCKS.map((s) => ({
          ...s,
          quote: null,
          marketCap: STOCK_CONFIG[s.symbol]?.marketCap || "",
          tags: STOCK_CONFIG[s.symbol]?.tags || [],
          thesis: STOCK_CONFIG[s.symbol]?.thesis || "",
          featured: STOCK_CONFIG[s.symbol]?.featured || false,
        }));
      }

      const quotes = await getQuotesBatch(instrumentKeys);

      return INDIAN_STOCKS.map((s) => {
        const key = getResolvedKey(s.symbol);
        const quote = key ? quotes[key] : null;
        const stockConfig = STOCK_CONFIG[s.symbol];

        return {
          ...s,
          quote: quote
            ? {
                c: quote.lastPrice,
                d: quote.change,
                dp: quote.changePercent,
                h: quote.high,
                l: quote.low,
                o: quote.open,
                pc: quote.close,
                v: quote.volume,
              }
            : null,
          marketCap: stockConfig?.marketCap || "",
          tags: stockConfig?.tags || [],
          thesis: stockConfig?.thesis || "",
          featured: stockConfig?.featured || false,
        };
      });
    },
    staleTime: 30000,
    retry: 2,
  });

  useEffect(() => {
    const loadAndSubscribe = async () => {
      const tickers = Object.keys(STOCK_CONFIG);
      await resolveAllInstrumentKeys();

      const instrumentKeys = tickers.map((t) => getResolvedKey(t)).filter(Boolean) as string[];

      if (instrumentKeys.length === 0) return;

      const unsubscribe = subscribeToStocks(
        instrumentKeys,
        (ticks) => {
          const newLiveQuotes = new Map<
            string,
            typeof liveQuotes extends Map<string, infer V> ? V : never
          >();

          for (const [key, tick] of Object.entries(ticks)) {
            newLiveQuotes.set(tick.symbol, {
              c: tick.ltp,
              d: tick.change,
              dp: tick.changePercent,
              h: tick.ltp,
              l: tick.ltp,
              o: tick.ltp,
              pc: tick.closePrice,
              v: tick.volume,
            });
          }
          setLiveQuotes(newLiveQuotes);
        },
        () => {},
      );

      return unsubscribe;
    };

    const result = loadAndSubscribe();
    return () => {
      result.then((unsubscribe) => unsubscribe?.());
    };
  }, []);

  useEffect(() => {
    const tickers = Object.keys(STOCK_CONFIG);

    const pollQuotes = async () => {
      const keys = tickers.map((t) => getResolvedKey(t)).filter(Boolean) as string[];

      if (keys.length === 0) return;

      try {
        const quotes = await getQuotesBatch(keys);
        const newLiveQuotes = new Map<
          string,
          typeof liveQuotes extends Map<string, infer V> ? V : never
        >();

        for (const ticker of tickers) {
          const key = getResolvedKey(ticker);
          if (key && quotes[key]) {
            const q = quotes[key];
            newLiveQuotes.set(ticker, {
              c: q.lastPrice,
              d: q.change,
              dp: q.changePercent,
              h: q.lastPrice,
              l: q.lastPrice,
              o: q.lastPrice,
              pc: q.close,
              v: q.volume,
            });
          }
        }

        setLiveQuotes(newLiveQuotes);
      } catch {}
    };

    pollQuotes();
    const interval = setInterval(pollQuotes, 5000);

    return () => clearInterval(interval);
  }, []);

  const stocks =
    initialData?.map((s) => {
      const liveQuote = liveQuotes.get(s.symbol);
      return {
        ...s,
        quote: liveQuote || s.quote,
      };
    }) || [];

  return { data: stocks, isLoading };
}

export function useMultipleQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes_batch", symbols.sort().join(",")],
    queryFn: async () => {
      await resolveAllInstrumentKeys();

      const keys = symbols.map((s) => getResolvedKey(s)).filter(Boolean) as string[];

      if (keys.length === 0) return {};

      const quotes = await getQuotesBatch(keys);

      const result: Record<string, StockQuote | null> = {};
      for (const sym of symbols) {
        const key = getResolvedKey(sym);
        result[sym] = key ? quotes[key] || null : null;
      }
      return result;
    },
    enabled: symbols.length > 0,
    staleTime: 30000,
    retry: 2,
  });
}

export function isMarketOpen(): boolean {
  return checkMarketOpen();
}

export function useResolveInstruments() {
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    resolveAllInstrumentKeys().then(() => {
      setResolved(true);
    });
  }, []);

  return { resolved, getKey: getResolvedKey };
}
