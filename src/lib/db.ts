import { supabase, QuizResponse, Portfolio, Transaction, Watchlist } from "./supabase";

export async function getUserProfile(userId: string): Promise<QuizResponse | null> {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveQuizResponse(
  userId: string,
  data: Omit<QuizResponse, "id" | "user_id" | "created_at">
): Promise<QuizResponse> {
  const { data: result, error } = await supabase
    .from("quiz_responses")
    .insert({
      user_id: userId,
      income_level: data.income_level,
      investment_amount: data.investment_amount,
      goal: data.goal,
      risk_appetite: data.risk_appetite,
      time_horizon: data.time_horizon,
      knowledge_level: data.knowledge_level,
      sector_preference: data.sector_preference,
      portfolio_mode: data.portfolio_mode,
      portfolio_resets_remaining: data.portfolio_resets_remaining,
      starting_balance: data.starting_balance,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateQuizResponse(
  userId: string,
  data: Partial<QuizResponse>
): Promise<QuizResponse> {
  const { data: result, error } = await supabase
    .from("quiz_responses")
    .update(data)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getUserPortfolio(userId: string): Promise<Portfolio[]> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

export async function addToPortfolio(
  userId: string,
  holding: Omit<Portfolio, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Portfolio> {
  const existing = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .eq("ticker", holding.ticker)
    .maybeSingle();

  if (existing.data) {
    const totalQty = existing.data.quantity + holding.quantity;
    const totalCost =
      existing.data.avg_buy_price * existing.data.quantity +
      holding.avg_buy_price * holding.quantity;
    const newAvgPrice = totalCost / totalQty;

    const { data, error } = await supabase
      .from("portfolios")
      .update({
        quantity: totalQty,
        avg_buy_price: newAvgPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.data.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: userId,
      ticker: holding.ticker,
      company_name: holding.company_name,
      quantity: holding.quantity,
      avg_buy_price: holding.avg_buy_price,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromPortfolio(
  userId: string,
  ticker: string,
  quantity: number
): Promise<void> {
  const existing = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();

  if (!existing.data) return;

  const newQty = existing.data.quantity - quantity;

  if (newQty <= 0) {
    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", existing.data.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("portfolios")
      .update({
        quantity: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.data.id);
    if (error) throw error;
  }
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTransaction(
  userId: string,
  txn: Omit<Transaction, "id" | "user_id" | "created_at">
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      ticker: txn.ticker,
      company_name: txn.company_name,
      type: txn.type,
      quantity: txn.quantity,
      price: txn.price,
      total_amount: txn.total_amount,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resetPortfolio(userId: string): Promise<void> {
  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getUserCashBalance(userId: string): Promise<number> {
  const profile = await getUserProfile(userId);
  if (!profile) return 1000000;
  return profile.starting_balance;
}

export async function updateUserCashBalance(
  userId: string,
  newBalance: number
): Promise<void> {
  await updateQuizResponse(userId, { starting_balance: newBalance });
}

export async function getWatchlist(userId: string): Promise<Watchlist[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToWatchlist(
  userId: string,
  item: Omit<Watchlist, "id" | "user_id" | "created_at">
): Promise<Watchlist> {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      ticker: item.ticker,
      company_name: item.company_name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(
  userId: string,
  ticker: string
): Promise<void> {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", ticker);

  if (error) throw error;
}

export async function isInWatchlist(
  userId: string,
  ticker: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}