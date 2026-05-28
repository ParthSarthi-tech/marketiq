import {
  getQueuedOrders as dbGetQueuedOrders,
  addQueuedOrder as dbAddQueuedOrder,
  cancelQueuedOrder as dbCancelQueuedOrder,
  executeQueuedOrders as dbExecuteQueuedOrders,
} from "./db";
import type { QueuedOrder as DbQueuedOrder } from "./db";

export type QueuedOrder = DbQueuedOrder;

export function getQueuedOrders(userId: string): Promise<DbQueuedOrder[]> {
  return dbGetQueuedOrders(userId);
}

export function addQueuedOrder(
  userId: string,
  ticker: string,
  companyName: string,
  type: "buy" | "sell",
  quantity: number,
  price: number,
): Promise<DbQueuedOrder> {
  return dbAddQueuedOrder(userId, ticker, companyName, type, quantity, price);
}

export function cancelQueuedOrder(userId: string, id: string): Promise<void> {
  return dbCancelQueuedOrder(userId, id);
}

export function executeQueuedOrders(
  userId: string,
  buy: (ticker: string, companyName: string, quantity: number, price: number) => Promise<unknown>,
  sell: (ticker: string, quantity: number, price: number) => Promise<unknown>,
): Promise<number> {
  return dbExecuteQueuedOrders(userId, buy, sell);
}
