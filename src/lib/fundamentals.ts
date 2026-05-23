import { STOCK_CONFIG } from "./stockMetadata";

export interface Fundamentals {
  sales: number;
  netProfit: number;
  eps: number;
  pe: number;
  opm: number;
  salesGrowth3Y: number | null;
  salesGrowth5Y: number | null;
  dividendPayout: number | null;
  year: string;
}

interface FundaEntry {
  ticker: string;
  name: string;
  fundamentals: Fundamentals;
}

function parseFundaCSV(filename: string, raw: string): FundaEntry | null {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (lines.length < 20) return null;

  // Build column index map from header row
  const header = lines[2].split(",").map((h) => h.trim());
  const trailingIdx = header.indexOf("Trailing");
  const colIdx = trailingIdx > 0 ? trailingIdx : header.length - 3;

  function val(name: string): number {
    for (let i = 3; i < 16; i++) {
      const cells = lines[i]?.split(",") ?? [];
      if (cells[0]?.trim() === name) {
        const raw = cells[colIdx]?.trim() || "0";
        return parseFloat(raw.replace(/,/g, "")) || 0;
      }
    }
    return 0;
  }

  function trendVal(sectionStart: number, label: string): number | null {
    for (let i = sectionStart; i < Math.min(sectionStart + 6, lines.length); i++) {
      const cells = lines[i]?.split(",") ?? [];
      if (cells[0]?.trim() === label) {
        const threeYear = cells[4]?.trim() || "";
        return parseFloat(threeYear.replace("%", "")) || null;
      }
    }
    return null;
  }

  function pctVal(name: string): number | null {
    for (let i = 17; i < Math.min(22, lines.length); i++) {
      const cells = lines[i]?.split(",") ?? [];
      if (cells[0]?.trim() === name) {
        const raw = cells[colIdx]?.trim() || "";
        return parseFloat(raw.replace("%", "")) || null;
      }
    }
    return null;
  }

  const sales = val("Sales");
  const netProfit = val("Net profit");
  const eps = val("EPS");
  const pe = val("Price to earning");
  const opm = val("Operating Profit");

  // Find trends section
  let trendsRow = -1;
  for (let i = 20; i < lines.length; i++) {
    if (lines[i].includes("TRENDS:")) { trendsRow = i + 1; break; }
  }

  const salesGrowth3Y = trendsRow > 0 ? trendVal(trendsRow, "Sales Growth") : null;
  const salesGrowth5Y = trendsRow > 0 ? (() => {
    for (let i = trendsRow; i < Math.min(trendsRow + 4, lines.length); i++) {
      const cells = lines[i]?.split(",") ?? [];
      if (cells[0]?.trim() === "Sales Growth") {
        const raw = cells[3]?.trim() || "";
        return parseFloat(raw.replace("%", "")) || null;
      }
    }
    return null;
  })() : null;

  const dividendPayout = pctVal("Dividend Payout");
  if (sales === 0 && netProfit === 0) return null;

  // Determine year from header
  const yearCol = header[colIdx]?.trim() || "TTM";

  return { ticker: "", name: "", fundamentals: { sales, netProfit, eps, pe, opm, salesGrowth3Y, salesGrowth5Y, dividendPayout, year: yearCol } };
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findTicker(filename: string): string | null {
  // Try matching csvFile first
  const csvRelative = `data/${filename}`;
  for (const [ticker, config] of Object.entries(STOCK_CONFIG)) {
    if (config.csvFile === csvRelative) return ticker;
  }

  // Fall back to name matching
  const csvName = normalizeName(filename.replace(/\.csv$/i, ""));
  for (const [ticker, config] of Object.entries(STOCK_CONFIG)) {
    const configName = normalizeName(config.name);
    if (configName.includes(csvName) || csvName.includes(configName)) return ticker;
  }

  return null;
}

const csvModules = import.meta.glob("/src/data/fundamentals/*.csv", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const fundaMap = new Map<string, FundaEntry>();

for (const [filepath, raw] of Object.entries(csvModules)) {
  const parts = filepath.split("/");
  const filename = parts[parts.length - 1]!;
  const ticker = findTicker(filename);
  if (!ticker) continue;

  const parsed = parseFundaCSV(filename, raw as string);
  if (parsed) {
    parsed.ticker = ticker;
    fundaMap.set(ticker, parsed);
  }
}

export function getFundamentals(ticker: string): Fundamentals | null {
  return fundaMap.get(ticker.toUpperCase())?.fundamentals ?? null;
}

export function getFundamentalsForTickers(tickers: string[]): Record<string, Fundamentals | null> {
  const result: Record<string, Fundamentals | null> = {};
  for (const t of tickers) result[t] = getFundamentals(t);
  return result;
}

export function getAllFundamentalsTickers(): string[] {
  return Array.from(fundaMap.keys());
}
