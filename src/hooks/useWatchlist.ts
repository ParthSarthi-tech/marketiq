import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface WatchlistItem {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  created_at: string;
}

export function useWatchlist(userId: string | null) {
  return useQuery({
    queryKey: ["watchlist", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as WatchlistItem[];
    },
    enabled: !!userId,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, ticker, companyName }: { userId: string; ticker: string; companyName: string }) => {
      const { data, error } = await supabase
        .from("watchlist")
        .insert({
          user_id: userId,
          ticker,
          company_name: companyName,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", variables.userId] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, ticker }: { userId: string; ticker: string }) => {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("ticker", ticker);
      
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", variables.userId] });
    },
  });
}