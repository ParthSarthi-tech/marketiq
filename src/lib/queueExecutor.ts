import { createServerFn } from "@tanstack/react-start";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client");
  }
  return createClient(url, key);
}

export type ExecResult = {
  executed: number;
  failed: number;
  details: { ticker: string; type: string; status: string; reason?: string }[];
};

export async function executeUserQueuedOrders(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExecResult> {
  const result: ExecResult = { executed: 0, failed: 0, details: [] };

  const { data: orders, error } = await supabase
    .from("queued_orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "queued")
    .order("created_at", { ascending: true });

  if (error || !orders || orders.length === 0) return result;

  const { data: profile } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let currentCash = profile?.starting_balance ?? 250000;

  const { data: portfolio } = await supabase.from("portfolios").select("*").eq("user_id", userId);

  const holdingMap: Record<string, { quantity: number; avg_buy_price: number; id: string }> = {};
  for (const h of portfolio ?? []) {
    holdingMap[h.ticker] = h;
  }

  for (const order of orders) {
    try {
      if (order.type === "buy") {
        const totalCost = order.quantity * order.price;
        if (totalCost > currentCash) {
          result.failed++;
          result.details.push({
            ticker: order.ticker,
            type: "buy",
            status: "failed",
            reason: "Insufficient funds",
          });
          continue;
        }

        const existing = holdingMap[order.ticker];
        if (existing) {
          const totalQty = existing.quantity + order.quantity;
          const totalCostExisting = existing.avg_buy_price * existing.quantity;
          const newAvgPrice = (totalCostExisting + totalCost) / totalQty;
          await supabase
            .from("portfolios")
            .update({
              quantity: totalQty,
              avg_buy_price: newAvgPrice,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("portfolios").insert({
            user_id: userId,
            ticker: order.ticker,
            company_name: order.company_name,
            quantity: order.quantity,
            avg_buy_price: order.price,
          });
        }

        await supabase.from("transactions").insert({
          user_id: userId,
          ticker: order.ticker,
          company_name: order.company_name,
          type: "buy",
          quantity: order.quantity,
          price: order.price,
          total_amount: totalCost,
        });

        currentCash -= totalCost;
        holdingMap[order.ticker] = {
          ...(holdingMap[order.ticker] || { id: "", avg_buy_price: 0 }),
          quantity: (holdingMap[order.ticker]?.quantity ?? 0) + order.quantity,
        };
      } else {
        const holding = holdingMap[order.ticker];
        if (!holding || holding.quantity < order.quantity) {
          result.failed++;
          result.details.push({
            ticker: order.ticker,
            type: "sell",
            status: "failed",
            reason: "Insufficient shares",
          });
          continue;
        }

        const newQty = holding.quantity - order.quantity;
        if (newQty <= 0) {
          await supabase.from("portfolios").delete().eq("id", holding.id);
        } else {
          await supabase
            .from("portfolios")
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq("id", holding.id);
        }

        await supabase.from("transactions").insert({
          user_id: userId,
          ticker: order.ticker,
          company_name: order.company_name,
          type: "sell",
          quantity: order.quantity,
          price: order.price,
          total_amount: order.quantity * order.price,
        });

        currentCash += order.quantity * order.price;
        if (holdingMap[order.ticker]) {
          holdingMap[order.ticker].quantity = newQty;
        }
      }

      await supabase.from("queued_orders").update({ status: "executed" }).eq("id", order.id);

      result.executed++;
      result.details.push({ ticker: order.ticker, type: order.type, status: "executed" });
    } catch (e) {
      result.failed++;
      result.details.push({
        ticker: order.ticker,
        type: order.type,
        status: "failed",
        reason: String(e),
      });
    }
  }

  if (currentCash !== (profile?.starting_balance ?? 250000)) {
    await supabase
      .from("quiz_responses")
      .update({ starting_balance: currentCash })
      .eq("user_id", userId);
  }

  return result;
}

export async function executeAllQueuedOrders(supabase: SupabaseClient): Promise<ExecResult> {
  const result: ExecResult = { executed: 0, failed: 0, details: [] };

  const { data: orders, error } = await supabase
    .from("queued_orders")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true });

  if (error || !orders || orders.length === 0) return result;

  const byUser: Record<string, typeof orders> = {};
  for (const order of orders) {
    if (!byUser[order.user_id]) byUser[order.user_id] = [];
    byUser[order.user_id].push(order);
  }

  for (const [userId, userOrders] of Object.entries(byUser)) {
    const userResult = await executeUserQueuedOrders(supabase, userId);
    result.executed += userResult.executed;
    result.failed += userResult.failed;
    result.details.push(...userResult.details);
  }

  return result;
}

export const serverExecuteAllQueuedOrders = createServerFn({ method: "POST" }).handler(
  async (): Promise<ExecResult> => {
    const supabase = getAdminClient();
    return executeAllQueuedOrders(supabase);
  },
);

export const serverExecuteUserQueuedOrders = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { userId: string })
  .handler(async (ctx): Promise<ExecResult> => {
    const supabase = getAdminClient();
    return executeUserQueuedOrders(supabase, ctx.data.userId);
  });
