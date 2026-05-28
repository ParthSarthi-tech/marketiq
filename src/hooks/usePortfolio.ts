import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  addTransaction,
  getUserCashBalance,
  updateUserCashBalance,
  updatePortfolioHolding,
} from "@/lib/db";
import { getQuotesBatch, type StockQuote } from "@/lib/upstox";
import { resolveAnyKey } from "@/lib/instrumentResolver";
import { getStockSector } from "@/lib/stockMetadata";
import { subscribeToStocks } from "@/lib/marketStream";
import type { Portfolio } from "@/lib/supabase";

export interface PortfolioHolding extends Portfolio {
  currentPrice: number;
  currentValue: number;
  pl: number;
  plPercent: number;
  change: number;
  changePercent: number;
}

export function usePortfolio(userId: string | null) {
  const queryClient = useQueryClient();
  const [liveQuotes, setLiveQuotes] = useState<Record<string, StockQuote>>({});

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery({
    queryKey: ["portfolio", userId],
    queryFn: () => (userId ? getUserPortfolio(userId) : Promise.resolve([])),
    enabled: !!userId,
  });

  const { data: quotes = {}, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", holdings.map((h) => h.ticker)],
    queryFn: async () => {
      const tickerToKey: Record<string, string> = {};
      const keys: string[] = [];
      for (const h of holdings) {
        const key = await resolveAnyKey(h.ticker);
        if (key) {
          tickerToKey[h.ticker] = key;
          keys.push(key);
        }
      }
      if (keys.length === 0) return {};
      const fetched = await getQuotesBatch(keys);
      const quotesMap: Record<string, StockQuote> = {};
      for (const [ticker, key] of Object.entries(tickerToKey)) {
        if (fetched[key]) {
          quotesMap[ticker] = fetched[key];
        }
      }
      return quotesMap;
    },
    enabled: holdings.length > 0,
    staleTime: 15000,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (holdings.length === 0) return;

    let cancelled = false;
    let unsub: (() => void) | null = null;

    (async () => {
      const keys: string[] = [];
      for (const h of holdings) {
        const key = await resolveAnyKey(h.ticker);
        if (key && !cancelled) keys.push(key);
      }
      if (cancelled || keys.length === 0) return;

      unsub = subscribeToStocks(
        keys,
        (ticks) => {
          setLiveQuotes((prev) => {
            const next = { ...prev };
            for (const [_key, tick] of Object.entries(ticks)) {
              next[tick.symbol] = {
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
              };
            }
            return next;
          });
        },
        () => {},
      );
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [holdings]);

  const { data: cashBalance = 250000 } = useQuery({
    queryKey: ["cashBalance", userId],
    queryFn: () => (userId ? getUserCashBalance(userId) : Promise.resolve(250000)),
    enabled: !!userId,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const mergedQuotes = { ...quotes, ...liveQuotes };

  const enrichedHoldings: PortfolioHolding[] = holdings.map((h) => {
    const quote = mergedQuotes[h.ticker];
    const currentPrice = quote?.c || h.avg_buy_price;
    const currentValue = currentPrice * h.quantity;
    const pl = (currentPrice - h.avg_buy_price) * h.quantity;
    const plPercent = ((currentPrice - h.avg_buy_price) / h.avg_buy_price) * 100;
    const change = quote?.d || 0;
    const changePercent = quote?.dp || 0;

    return {
      ...h,
      currentPrice,
      currentValue,
      pl,
      plPercent,
      change,
      changePercent,
    };
  });

  const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.avg_buy_price * h.quantity, 0);
  const totalPL = totalValue - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const addMutation = useMutation({
    mutationFn: async ({
      userId,
      ticker,
      companyName,
      quantity,
      price,
      currentCash,
    }: {
      userId: string;
      ticker: string;
      companyName: string;
      quantity: number;
      price: number;
      currentCash: number;
    }) => {
      const totalCost = quantity * price;
      if (totalCost > currentCash) {
        throw new Error("Insufficient funds");
      }
      const result = await addToPortfolio(userId, {
        ticker,
        company_name: companyName,
        quantity,
        avg_buy_price: price,
      });
      await addTransaction(userId, {
        ticker,
        company_name: companyName,
        type: "buy",
        quantity,
        price,
        total_amount: totalCost,
      });
      await updateUserCashBalance(userId, currentCash - totalCost);
      return result;
    },
    onMutate: async ({ userId, currentCash, quantity, price }) => {
      await queryClient.cancelQueries({ queryKey: ["cashBalance", userId] });
      const prev = queryClient.getQueryData(["cashBalance", userId]);
      queryClient.setQueryData(["cashBalance", userId], currentCash - quantity * price);
      return { prev };
    },
    onError: (_err, { userId }, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(["cashBalance", userId], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
      queryClient.invalidateQueries({ queryKey: ["cashBalance", userId] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({
      userId,
      ticker,
      quantity,
      price,
      currentCash,
    }: {
      userId: string;
      ticker: string;
      quantity: number;
      price: number;
      currentCash: number;
    }) => {
      const holding = holdings.find((h) => h.ticker === ticker);
      if (!holding) throw new Error("Holding not found");
      if (quantity > holding.quantity) throw new Error("Insufficient shares");

      await addTransaction(userId, {
        ticker,
        company_name: holding.company_name,
        type: "sell",
        quantity,
        price,
        total_amount: quantity * price,
      });

      await removeFromPortfolio(userId, ticker, quantity);
      await updateUserCashBalance(userId, currentCash + quantity * price);
    },
    onMutate: async ({ userId, currentCash, quantity, price }) => {
      await queryClient.cancelQueries({ queryKey: ["cashBalance", userId] });
      const prev = queryClient.getQueryData(["cashBalance", userId]);
      queryClient.setQueryData(["cashBalance", userId], currentCash + quantity * price);
      return { prev };
    },
    onError: (_err, { userId }, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(["cashBalance", userId], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
      queryClient.invalidateQueries({ queryKey: ["cashBalance", userId] });
    },
  });

  const buy = useCallback(
    (ticker: string, companyName: string, quantity: number, price: number) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      if (quantity * price > cashBalance) return Promise.reject(new Error("Insufficient funds"));
      return addMutation.mutateAsync({
        userId,
        ticker,
        companyName,
        quantity,
        price,
        currentCash: cashBalance,
      });
    },
    [userId, cashBalance, addMutation],
  );

  const sell = useCallback(
    (ticker: string, quantity: number, price: number) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      const holding = holdings.find((h) => h.ticker === ticker);
      if (!holding) return Promise.reject(new Error("Holding not found"));
      return sellMutation.mutateAsync({
        userId,
        ticker,
        quantity,
        price,
        currentCash: cashBalance,
      });
    },
    [userId, holdings, cashBalance, sellMutation],
  );

  const editHolding = useCallback(
    (ticker: string, data: { avg_buy_price?: number; quantity?: number }) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return updatePortfolioHolding(userId, ticker, data).then(() => {
        queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
      });
    },
    [userId, queryClient],
  );

  const deleteHolding = useCallback(
    (ticker: string) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      const holding = holdings.find((h) => h.ticker === ticker);
      if (!holding) return Promise.reject(new Error("Holding not found"));
      return sellMutation.mutateAsync({
        userId,
        ticker,
        quantity: holding.quantity,
        price: holding.avg_buy_price,
        currentCash: cashBalance,
      });
    },
    [userId, holdings, cashBalance, sellMutation],
  );

  const sectorAllocation = enrichedHoldings.reduce(
    (acc, h) => {
      const sector = getStockSector(h.ticker);
      acc[sector] = (acc[sector] || 0) + h.currentValue;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    holdings: enrichedHoldings,
    cashBalance,
    totalValue,
    totalInvested,
    totalPL,
    totalPLPercent,
    sectorAllocation,
    loading: holdingsLoading || quotesLoading,
    buy,
    sell,
    editHolding,
    deleteHolding,
    isBuying: addMutation.isPending,
    isSelling: sellMutation.isPending,
  };
}
