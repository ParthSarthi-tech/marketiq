export const KNOWN_INSTRUMENT_KEYS: Record<string, string> = {
  // Populated as stocks are resolved via Upstox search
  // Format: TICKER -> instrument_key (e.g., "NSE_EQ|TCS")
};

export function getKnownKey(ticker: string): string | null {
  return KNOWN_INSTRUMENT_KEYS[ticker] ?? null;
}

export function setKnownKey(ticker: string, key: string): void {
  KNOWN_INSTRUMENT_KEYS[ticker] = key;
}

export function setKnownKeys(keys: Record<string, string>): void {
  Object.assign(KNOWN_INSTRUMENT_KEYS, keys);
}

export function getAllKnownTickers(): string[] {
  return Object.keys(KNOWN_INSTRUMENT_KEYS);
}

export function isKnown(ticker: string): boolean {
  return ticker in KNOWN_INSTRUMENT_KEYS;
}
