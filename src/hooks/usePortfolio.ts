import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  addTransaction,
  getUserCashBalance,
  updateUserCashBalance,
} from "@/lib/db";
import { getQuotesBatch, type StockQuote } from "@/lib/upstox";
import { resolveAnyKey } from "@/lib/instrumentResolver";
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
    staleTime: 30000,
  });

  const { data: cashBalance = 250000 } = useQuery({
    queryKey: ["cashBalance", userId],
    queryFn: () => (userId ? getUserCashBalance(userId) : Promise.resolve(250000)),
    enabled: !!userId,
  });

  const enrichedHoldings: PortfolioHolding[] = holdings.map((h) => {
    const quote = quotes[h.ticker];
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

  const sectorAllocation = enrichedHoldings.reduce(
    (acc, h) => {
      const sector = h.company_name?.split(" ")[0] || "Other";
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
    isBuying: addMutation.isPending,
    isSelling: sellMutation.isPending,
  };
}
