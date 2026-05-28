export interface MarketStatus {
  open: boolean;
  message: string;
}

export function isMarketOpen(): MarketStatus {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  if (day === 0 || day === 6) {
    return { open: false, message: "Markets closed (Weekend)" };
  }
  if (currentTime < marketOpen) {
    return { open: false, message: "Markets open at 9:15 AM" };
  }
  if (currentTime >= marketClose) {
    return { open: false, message: "Markets closed for the day" };
  }
  return { open: true, message: "Markets open" };
}

export function isMarketOpenBool(): boolean {
  return isMarketOpen().open;
}
