export interface QueuedOrder {
  id: string;
  ticker: string;
  companyName: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalCost: number;
  createdAt: string;
  status: "queued" | "executed" | "cancelled";
}

function storageKey(userId: string) {
  return `marketiq_orders_${userId}`;
}

export function getQueuedOrders(userId: string): QueuedOrder[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addQueuedOrder(
  userId: string,
  ticker: string,
  companyName: string,
  type: "buy" | "sell",
  quantity: number,
  price: number,
): QueuedOrder {
  const orders = getQueuedOrders(userId);
  const order: QueuedOrder = {
    id: crypto.randomUUID(),
    ticker,
    companyName,
    type,
    quantity,
    price,
    totalCost: quantity * price,
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  orders.unshift(order);
  localStorage.setItem(storageKey(userId), JSON.stringify(orders));
  return order;
}

export function cancelQueuedOrder(userId: string, id: string) {
  const orders = getQueuedOrders(userId);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = "cancelled";
    localStorage.setItem(storageKey(userId), JSON.stringify(orders));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeQueuedOrders(
  userId: string,
  buy: (ticker: string, companyName: string, quantity: number, price: number) => Promise<any>,
  sell: (ticker: string, quantity: number, price: number) => Promise<any>,
): number {
  const orders = getQueuedOrders(userId);
  const pending = orders.filter((o) => o.status === "queued");
  let executed = 0;

  for (const order of pending) {
    try {
      if (order.type === "buy") {
        buy(order.ticker, order.companyName, order.quantity, order.price);
      } else {
        sell(order.ticker, order.quantity, order.price);
      }
      const idx = orders.findIndex((o) => o.id === order.id);
      if (idx !== -1) {
        orders[idx].status = "executed";
      }
      executed++;
    } catch {
      // skip failed orders
    }
  }

  if (executed > 0) {
    localStorage.setItem(storageKey(userId), JSON.stringify(orders));
  }
  return executed;
}
