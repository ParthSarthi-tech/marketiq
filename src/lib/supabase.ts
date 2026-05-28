import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type QuizResponse = {
  id: string;
  user_id: string;
  income_level: string;
  investment_amount: string;
  goal: string;
  risk_appetite: string;
  time_horizon: string;
  knowledge_level: string;
  sector_preference: string[];
  portfolio_mode: string;
  portfolio_resets_remaining: number;
  starting_balance: number;
  created_at: string;
};

export type Portfolio = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  quantity: number;
  avg_buy_price: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
};

export type Watchlist = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  created_at: string;
};

export const PROFILE_RISK_MAP: Record<string, number> = {
  low: 25,
  "med-low": 45,
  "med-high": 70,
  high: 90,
};

export const RISK_PROFILE_MAP: Record<string, string> = {
  low: "Conservative",
  "med-low": "Moderate Conservative",
  "med-high": "Moderate Aggressive",
  high: "Aggressive",
};