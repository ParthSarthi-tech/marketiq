export interface StockData {
  symbol: string;
  companyName: string;
  sales: number[];
  expenses: number[];
  operatingProfit: number[];
  netProfit: number[];
  eps: number[];
  price: number[];
  pe: number[];
  opm: number[];
  dividendPayout: number[];
  currentSales: number;
  currentOPM: number;
  currentPE: number;
  currentEPS: number;
  currentPrice: number;
  currentDividendPayout: number;
  trends: {
    salesGrowth: number;
    opmTrend: number;
    peTrend: "declining" | "stable" | "increasing";
  };
}

export function parseCSV(csvText: string, symbol: string): StockData | null {
  const lines = csvText.trim().split("\n");
  const data: Record<string, string[]> = {};
  
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 2) continue;
    
    const key = parts[0].trim().replace(/"/g, "");
    const values = parts.slice(1).map(v => v.trim().replace(/"/g, ""));
    
    if (key && values.length > 0) {
      data[key] = values;
    }
  }
  
  if (!data["Sales"] || !data["EPS"]) return null;
  
  const parseNumber = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };
  
  const getLatestValue = (arr: string[]): number => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const val = parseNumber(arr[i]);
      if (val > 0) return val;
    }
    return 0;
  };
  
  const years = data["Narration"] || [];
  const salesIdx = years.findIndex(y => y.includes("2025") || y.includes("Trailing"));
  const salesGrowth = data["TRENDS:"]?.[1] ? parseNumber(data["TRENDS:"][1]) : 0;
  
  const peValues = data["Price to earning"] || [];
  const currentPE = getLatestValue(peValues);
  
  let peTrend: "declining" | "stable" | "increasing" = "stable";
  if (peValues.length >= 3) {
    const recent = parseNumber(peValues[peValues.length - 2]);
    const old = parseNumber(peValues[3]);
    if (recent < old * 0.7) peTrend = "declining";
    else if (recent > old * 1.3) peTrend = "increasing";
  }
  
  return {
    symbol,
    companyName: symbol,
    sales: data["Sales"]?.map(parseNumber) || [],
    expenses: data["Expenses"]?.map(parseNumber) || [],
    operatingProfit: data["Operating Profit"]?.map(parseNumber) || [],
    netProfit: data["Net profit"]?.map(parseNumber) || [],
    eps: data["EPS"]?.map(parseNumber) || [],
    price: data["Price"]?.map(parseNumber) || [],
    pe: peValues.map(parseNumber),
    opm: data["OPM"]?.map(v => parseFloat(v.replace("%", ""))) || [],
    dividendPayout: data["Dividend Payout"]?.map(v => parseFloat(v.replace("%", ""))) || [],
    currentSales: getLatestValue(data["Sales"] || []),
    currentOPM: getLatestValue(data["OPM"]?.map(v => v.replace("%", "")) || []),
    currentPE,
    currentEPS: getLatestValue(data["EPS"] || []),
    currentPrice: getLatestValue(data["Price"] || []),
    currentDividendPayout: getLatestValue(data["Dividend Payout"]?.map(v => v.replace("%", "")) || []),
    trends: {
      salesGrowth,
      opmTrend: 0,
      peTrend,
    },
  };
}