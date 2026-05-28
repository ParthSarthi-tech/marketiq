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
  data: Omit<QuizResponse, "id" | "user_id" | "created_at">,
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
  data: Partial<QuizResponse>,
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
  const { data, error } = await supabase.from("portfolios").select("*").eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

export async function addToPortfolio(
  userId: string,
  holding: Omit<Portfolio, "id" | "user_id" | "created_at" | "updated_at">,
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

export async function updatePortfolioHolding(
  userId: string,
  ticker: string,
  data: { avg_buy_price?: number; quantity?: number },
): Promise<Portfolio> {
  const existing = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();
  if (!existing.data) throw new Error("Holding not found");

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.avg_buy_price !== undefined) updates.avg_buy_price = data.avg_buy_price;
  if (data.quantity !== undefined) updates.quantity = data.quantity;

  const { data: result, error } = await supabase
    .from("portfolios")
    .update(updates)
    .eq("id", existing.data.id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function removeFromPortfolio(
  userId: string,
  ticker: string,
  quantity: number,
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
    const { error } = await supabase.from("portfolios").delete().eq("id", existing.data.id);
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
  txn: Omit<Transaction, "id" | "user_id" | "created_at">,
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

export async function clearTransactions(userId: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function resetPortfolio(userId: string): Promise<void> {
  const { error: portfolioError } = await supabase.from("portfolios").delete().eq("user_id", userId);
  if (portfolioError) throw portfolioError;

  const { error: txnError } = await supabase.from("transactions").delete().eq("user_id", userId);
  if (txnError) throw txnError;

  const existing = await getUserProfile(userId);
  if (existing) {
    await updateQuizResponse(userId, { starting_balance: 250000 });
  } else {
    const { error } = await supabase.from("quiz_responses").insert({
      user_id: userId,
      starting_balance: 250000,
      income_level: "",
      investment_amount: "",
      goal: "",
      risk_appetite: "med-high",
      time_horizon: "",
      knowledge_level: "",
      sector_preference: [],
      portfolio_mode: "manual",
      portfolio_resets_remaining: 2,
    });
    if (error) throw error;
  }
}

export async function getUserCashBalance(userId: string): Promise<number> {
  const profile = await getUserProfile(userId);
  if (!profile) return 250000;
  return profile.starting_balance;
}

export async function updateUserCashBalance(userId: string, newBalance: number): Promise<void> {
  const existing = await getUserProfile(userId);
  if (existing) {
    await updateQuizResponse(userId, { starting_balance: newBalance });
  } else {
    const { error } = await supabase.from("quiz_responses").insert({
      user_id: userId,
      starting_balance: newBalance,
      income_level: "",
      investment_amount: "",
      goal: "",
      risk_appetite: "med-high",
      time_horizon: "",
      knowledge_level: "",
      sector_preference: [],
      portfolio_mode: "manual",
      portfolio_resets_remaining: 2,
    });
    if (error) throw error;
  }
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
  item: Omit<Watchlist, "id" | "user_id" | "created_at">,
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

export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", ticker);

  if (error) throw error;
}

export async function isInWatchlist(userId: string, ticker: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export type QueuedOrder = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total_cost: number;
  created_at: string;
  status: "queued" | "executed" | "cancelled";
};

export async function getQueuedOrders(userId: string): Promise<QueuedOrder[]> {
  const { data, error } = await supabase
    .from("queued_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addQueuedOrder(
  userId: string,
  ticker: string,
  companyName: string,
  type: "buy" | "sell",
  quantity: number,
  price: number,
): Promise<QueuedOrder> {
  const { data, error } = await supabase
    .from("queued_orders")
    .insert({
      user_id: userId,
      ticker,
      company_name: companyName,
      type,
      quantity,
      price,
      total_cost: quantity * price,
      status: "queued",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelQueuedOrder(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("queued_orders")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function executeQueuedOrders(
  userId: string,
  buy: (ticker: string, companyName: string, quantity: number, price: number) => Promise<unknown>,
  sell: (ticker: string, quantity: number, price: number) => Promise<unknown>,
): Promise<number> {
  const orders = await getQueuedOrders(userId);
  const pending = orders.filter((o) => o.status === "queued");
  let executed = 0;

  for (const order of pending) {
    try {
      if (order.type === "buy") {
        await buy(order.ticker, order.company_name, order.quantity, order.price);
      } else {
        await sell(order.ticker, order.quantity, order.price);
      }
      await supabase
        .from("queued_orders")
        .update({ status: "executed" })
        .eq("id", order.id);
      executed++;
    } catch {
      // skip failed individual orders
    }
  }

  return executed;
}
