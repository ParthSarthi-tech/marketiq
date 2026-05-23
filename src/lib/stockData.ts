import { getCsvFile, STOCK_CONFIG } from "./stockMetadata";
import { fetchFinnhubData } from "./finnhub-proxy";

export type DataSource = "csv" | "hardcoded" | "finnhub";

export interface StockData {
  symbol: string;
  companyName: string;
  currentSales: number;
  currentOPM: number;
  currentPE: number;
  currentEPS: number;
  currentPrice: number;
  currentDividendPayout: number;
  sector: string;
  marketCap: string;
  week52High: number;
  week52Low: number;
  revenueGrowth: number[];
  profitGrowth: number[];
  peHistory: number[];
  opmHistory: number[];
  trends: {
    salesGrowth: number;
    peTrend: "declining" | "stable" | "increasing";
    opmTrend: "improving" | "stable" | "declining";
  };
  dataSource: DataSource;
}

const csvCache = new Map<string, StockData>();

async function loadFromCSV(symbol: string): Promise<StockData | null> {
  if (csvCache.has(symbol)) {
    return csvCache.get(symbol)!;
  }

  const csvFile = getCsvFile(symbol);
  if (!csvFile) return null;

  try {
    const response = await fetch(`/${csvFile}`);
    if (!response.ok) {
      console.warn(`[stockData] CSV not found: ${csvFile}`);
      return null;
    }

    const csvText = await response.text();
    const parsed = parseCSVData(csvText, symbol);

    if (parsed) {
      csvCache.set(symbol, parsed);
      console.log(`[stockData] Loaded fundamentals from CSV: ${symbol}`);
    }

    return parsed;
  } catch (e) {
    console.error(`[stockData] Error loading CSV for ${symbol}:`, e);
    return null;
  }
}

function parseCSVData(csvText: string, symbol: string): StockData | null {
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
    const num = parseFloat(val.replace(/%/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const getLatestValue = (arr: string[]): number => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const val = parseNumber(arr[i]);
      if (val > 0) return val;
    }
    return 0;
  };

  const sales = data["Sales"]?.map(parseNumber) || [];
  const netProfit = data["Net profit"]?.map(parseNumber) || [];
  const eps = data["EPS"]?.map(parseNumber) || [];
  const price = data["Price"]?.map(parseNumber) || [];
  const pe = data["Price to earning"]?.map(parseNumber) || [];
  const opm = data["OPM"]?.map(parseNumber) || [];
  const dividend = data["Dividend Payout"]?.map(parseNumber) || [];

  const trendsData = data["TRENDS:"];
  const salesGrowth = trendsData?.[1] ? parseNumber(trendsData[1]) : 10;

  let peTrend: "declining" | "stable" | "increasing" = "stable";
  if (pe.length >= 3) {
    const recent = pe[pe.length - 2] || 0;
    const old = pe[3] || 0;
    if (recent < old * 0.7) peTrend = "declining";
    else if (recent > old * 1.3) peTrend = "increasing";
  }

  const config = STOCK_CONFIG[symbol];
  const currentPrice = getLatestValue(price);
  const week52High = currentPrice * 1.2;
  const week52Low = currentPrice * 0.8;

  return {
    symbol,
    companyName: config?.name || symbol,
    currentSales: getLatestValue(sales),
    currentOPM: getLatestValue(opm),
    currentPE: getLatestValue(pe),
    currentEPS: getLatestValue(eps),
    currentPrice,
    currentDividendPayout: getLatestValue(dividend),
    sector: config?.sector || "Other",
    marketCap: config?.marketCap || "₹1L Cr",
    week52High: Math.round(week52High),
    week52Low: Math.round(week52Low),
    revenueGrowth: sales.slice(-8).length >= 8 ? sales.slice(-8) : [5, 6, 7, 8, 9, 10, 11, 12],
    profitGrowth: netProfit.slice(-8).length >= 8 ? netProfit.slice(-8) : [3, 4, 5, 6, 7, 8, 9, 10],
    peHistory: pe.slice(-8).length >= 8 ? pe.slice(-8) : [20, 21, 22, 23, 24, 25, 26, 27],
    opmHistory: opm.slice(-8).length >= 8 ? opm.slice(-8) : [20, 21, 22, 23, 24, 25, 26, 27],
    trends: {
      salesGrowth,
      peTrend,
      opmTrend: "stable" as const,
    },
    dataSource: "csv" as const,
  };
}

const STOCK_FUNDAMENTALS: Record<string, StockData> = {
  TCS: {
    symbol: "TCS", companyName: "Tata Consultancy Services",
    currentSales: 267021, currentOPM: 27.1, currentPE: 17.3, currentEPS: 136.0,
    currentPrice: 2358.9, currentDividendPayout: 80.9,
    sector: "Information Technology", marketCap: "₹4.6L Cr",
    week52High: 4250, week52Low: 2150,
    revenueGrowth: [10.2, 12.5, 14.2, 15.8, 18.2, 17.5, 16.2, 18.5],
    profitGrowth: [8.5, 12.2, 15.8, 18.2, 22.5, 19.8, 17.2, 18.5],
    peHistory: [25.2, 24.5, 23.8, 22.2, 21.5, 20.2, 18.5, 17.3],
    opmHistory: [26.2, 26.5, 26.8, 27.2, 27.5, 27.2, 27.0, 27.1],
    trends: { salesGrowth: 18.5, peTrend: "declining", opmTrend: "stable"  },
  },
HDFCRELIANCE: {
    symbol: "RELIANCE", companyName: "Reliance Industries",
    currentSales: 987000, currentOPM: 14.2, currentPE: 28.5, currentEPS: 102.5,
    currentPrice: 2920.0, currentDividendPayout: 35.0,
    sector: "Conglomerate", marketCap: "₹20.5L Cr",
    week52High: 3200, week52Low: 2200,
    revenueGrowth: [5.2, 6.5, 8.2, 10.5, 12.8, 15.2, 10.5, 8.2],
    profitGrowth: [6.5, 8.2, 10.5, 13.8, 18.2, 22.5, 15.2, 10.8],
    peHistory: [28.5, 27.8, 26.5, 25.2, 24.5, 26.8, 28.2, 28.5],
    opmHistory: [12.5, 13.2, 13.8, 14.2, 14.8, 14.5, 14.2, 14.2],
    trends: { salesGrowth: 8.2, peTrend: "stable", opmTrend: "stable"  },
  },
HDFCBANK: {
    symbol: "HDFCBANK", companyName: "HDFC Bank",
    currentSales: 145000, currentOPM: 38.5, currentPE: 18.5, currentEPS: 38.0,
    currentPrice: 702.0, currentDividendPayout: 50.0,
    sector: "Financial Services", marketCap: "₹12.5L Cr",
    week52High: 780, week52Low: 580,
    revenueGrowth: [8.2, 10.5, 12.8, 15.2, 18.5, 14.2, 11.8, 12.8],
    profitGrowth: [6.5, 9.2, 12.5, 16.8, 21.2, 15.5, 10.2, 12.8],
    peHistory: [22.5, 21.8, 20.5, 19.2, 18.8, 19.5, 18.2, 18.5],
    opmHistory: [36.5, 37.2, 37.8, 38.2, 38.8, 38.5, 38.2, 38.5],
    trends: { salesGrowth: 12.8, peTrend: "declining", opmTrend: "stable" }  },
INFY: {
    symbol: "INFY", companyName: "Infosys",
    currentSales: 155000, currentOPM: 25.2, currentPE: 20.5, currentEPS: 64.0,
    currentPrice: 1312.0, currentDividendPayout: 40.0,
    sector: "Information Technology", marketCap: "₹5.4L Cr",
    week52High: 1550, week52Low: 1050,
    revenueGrowth: [3.2, 5.5, 7.8, 9.2, 8.5, 6.2, 5.8, 6.2],
    profitGrowth: [2.5, 4.8, 7.2, 8.5, 9.2, 6.5, 5.2, 6.5],
    peHistory: [24.5, 23.8, 22.5, 21.8, 21.2, 20.8, 20.2, 20.5],
    opmHistory: [24.2, 24.5, 24.8, 25.2, 25.5, 25.2, 25.0, 25.2],
    trends: { salesGrowth: 6.2, peTrend: "stable", opmTrend: "stable" }  },
ITC: {
    symbol: "ITC", companyName: "ITC Limited",
    currentSales: 77000, currentOPM: 38.5, currentPE: 22.0, currentEPS: 16.5,
    currentPrice: 364.0, currentDividendPayout: 95.0,
    sector: "Fast Moving Consumer Goods", marketCap: "₹4.5L Cr",
    week52High: 430, week52Low: 280,
    revenueGrowth: [5.2, 6.8, 8.5, 10.2, 12.5, 9.8, 7.5, 8.5],
    profitGrowth: [4.5, 6.2, 8.8, 11.2, 14.5, 10.2, 7.8, 8.5],
    peHistory: [25.2, 24.5, 23.8, 23.2, 22.8, 22.5, 22.2, 22.0],
    opmHistory: [36.8, 37.2, 37.5, 38.2, 38.8, 38.5, 38.2, 38.5],
    trends: { salesGrowth: 8.5, peTrend: "stable", opmTrend: "stable" }  },
LT: {
    symbol: "LT", companyName: "Larsen & Toubro",
    currentSales: 215000, currentOPM: 12.5, currentPE: 28.0, currentEPS: 92.0,
    currentPrice: 2576.0, currentDividendPayout: 45.0,
    sector: "Infrastructure", marketCap: "₹3.6L Cr",
    week52High: 3200, week52Low: 1850,
    revenueGrowth: [8.5, 10.2, 12.8, 15.5, 18.2, 16.5, 14.2, 15.2],
    profitGrowth: [5.2, 7.5, 10.2, 14.5, 18.5, 12.8, 9.5, 10.5],
    peHistory: [32.5, 31.2, 30.5, 29.8, 29.2, 28.8, 28.2, 28.0],
    opmHistory: [11.2, 11.5, 11.8, 12.2, 12.8, 12.5, 12.2, 12.5],
    trends: { salesGrowth: 15.2, peTrend: "stable", opmTrend: "stable" }  },
SBIN: {
    symbol: "SBIN", companyName: "State Bank of India",
    currentSales: 385000, currentOPM: 42.2, currentPE: 8.5, currentEPS: 85.0,
    currentPrice: 722.0, currentDividendPayout: 35.0,
    sector: "Financial Services", marketCap: "₹6.5L Cr",
    week52High: 850, week52Low: 520,
    revenueGrowth: [5.2, 6.8, 8.5, 10.2, 12.5, 10.8, 8.5, 9.5],
    profitGrowth: [15.2, 18.5, 22.5, 28.2, 35.5, 25.2, 18.5, 20.2],
    peHistory: [12.5, 11.8, 10.5, 9.8, 9.2, 8.8, 8.5, 8.5],
    opmHistory: [38.5, 39.2, 40.5, 41.2, 42.5, 42.2, 42.0, 42.2],
    trends: { salesGrowth: 9.5, peTrend: "declining", opmTrend: "improving" }  },
BAJFINANCE: {
    symbol: "BAJFINANCE", companyName: "Bajaj Finance",
    currentSales: 42000, currentOPM: 58.2, currentPE: 32.5, currentEPS: 225.0,
    currentPrice: 7312.0, currentDividendPayout: 20.0,
    sector: "Financial Services", marketCap: "₹4.3L Cr",
    week52High: 8200, week52Low: 4500,
    revenueGrowth: [18.5, 20.2, 22.8, 25.5, 28.2, 26.5, 24.2, 25.2],
    profitGrowth: [20.2, 22.5, 25.8, 30.2, 35.5, 28.5, 22.8, 24.5],
    peHistory: [38.5, 37.2, 35.8, 34.2, 33.5, 33.2, 32.8, 32.5],
    opmHistory: [52.5, 54.2, 55.8, 57.2, 58.5, 58.2, 58.0, 58.2],
    trends: { salesGrowth: 25.2, peTrend: "stable", opmTrend: "improving" }  },
TITAN: {
    symbol: "TITAN", companyName: "Titan Company",
    currentSales: 52000, currentOPM: 15.2, currentPE: 35.0, currentEPS: 42.0,
    currentPrice: 1470.0, currentDividendPayout: 45.0,
    sector: "Consumer Durables", marketCap: "₹1.3L Cr",
    week52High: 1650, week52Low: 950,
    revenueGrowth: [8.2, 10.5, 12.8, 15.2, 18.5, 16.2, 13.5, 14.5],
    profitGrowth: [5.5, 8.2, 10.5, 14.2, 18.8, 14.5, 11.2, 12.8],
    peHistory: [28.5, 29.8, 31.2, 32.5, 33.8, 34.5, 35.2, 35.0],
    opmHistory: [13.5, 14.2, 14.5, 14.8, 15.2, 15.5, 15.2, 15.2],
    trends: { salesGrowth: 14.5, peTrend: "increasing", opmTrend: "stable" }  },
ADANIPORTS: {
    symbol: "ADANIPORTS", companyName: "Adani Ports",
    currentSales: 32000, currentOPM: 52.5, currentPE: 28.0, currentEPS: 52.0,
    currentPrice: 1456.0, currentDividendPayout: 25.0,
    sector: "Services", marketCap: "₹3.0L Cr",
    week52High: 1680, week52Low: 950,
    revenueGrowth: [12.5, 14.2, 16.5, 18.8, 22.5, 20.2, 17.5, 18.5],
    profitGrowth: [10.2, 13.5, 16.8, 21.2, 26.5, 19.8, 15.2, 16.5],
    peHistory: [32.5, 31.2, 30.5, 29.8, 29.2, 28.5, 28.2, 28.0],
    opmHistory: [48.5, 49.2, 50.5, 51.2, 52.8, 52.5, 52.2, 52.5],
    trends: { salesGrowth: 18.5, peTrend: "stable", opmTrend: "improving" }  },
SUNPHARMA: {
    symbol: "SUNPHARMA", companyName: "Sun Pharma",
    currentSales: 85000, currentOPM: 22.5, currentPE: 25.0, currentEPS: 58.0,
    currentPrice: 1450.0, currentDividendPayout: 35.0,
    sector: "Healthcare", marketCap: "₹3.5L Cr",
    week52High: 1680, week52Low: 1050,
    revenueGrowth: [2.5, 3.8, 5.2, 6.8, 8.5, 6.2, 4.5, 5.2],
    profitGrowth: [1.2, 2.5, 4.2, 6.5, 9.2, 5.8, 3.5, 4.2],
    peHistory: [28.5, 27.8, 27.2, 26.5, 26.2, 25.8, 25.2, 25.0],
    opmHistory: [20.5, 21.2, 21.8, 22.2, 22.8, 22.5, 22.2, 22.5],
    trends: { salesGrowth: 5.2, peTrend: "declining", opmTrend: "stable" }  },
BHARTIARTL: {
    symbol: "BHARTIARTL", companyName: "Bharti Airtel",
    currentSales: 145000, currentOPM: 45.2, currentPE: 22.5, currentEPS: 18.5,
    currentPrice: 416.0, currentDividendPayout: 30.0,
    sector: "Telecommunication", marketCap: "₹2.4L Cr",
    week52High: 520, week52Low: 320,
    revenueGrowth: [6.5, 7.8, 9.2, 10.5, 12.8, 11.2, 9.5, 10.2],
    profitGrowth: [8.2, 10.5, 12.8, 16.5, 22.5, 15.2, 11.8, 13.5],
    peHistory: [25.2, 24.5, 23.8, 23.2, 22.8, 22.5, 22.2, 22.5],
    opmHistory: [42.5, 43.2, 44.2, 44.8, 45.5, 45.2, 45.0, 45.2],
    trends: { salesGrowth: 10.2, peTrend: "stable", opmTrend: "improving" }  },
  AXISBANK: {
    symbol: "AXISBANK", companyName: "Axis Bank",
    currentSales: 95000, currentOPM: 38.2, currentPE: 14.2, currentEPS: 85.0,
    currentPrice: 1205.0, currentDividendPayout: 55.0,
    sector: "Financial Services", marketCap: "₹3.7L Cr",
    week52High: 1420, week52Low: 880,
    revenueGrowth: [8.5, 10.2, 12.5, 14.8, 17.5, 15.2, 12.8, 14.2],
    profitGrowth: [10.2, 13.5, 17.2, 22.5, 28.5, 20.2, 15.5, 17.8],
    peHistory: [18.5, 17.2, 16.5, 15.8, 15.2, 14.8, 14.5, 14.2],
    opmHistory: [35.5, 36.2, 37.2, 37.8, 38.5, 38.2, 38.0, 38.2],
    trends: { salesGrowth: 14.2, peTrend: "declining", opmTrend: "stable" }  },
  KOTAKBANK: {
    symbol: "KOTAKBANK", companyName: "Kotak Mahindra Bank",
    currentSales: 48000, currentOPM: 42.8, currentPE: 18.5, currentEPS: 92.0,
    currentPrice: 1702.0, currentDividendPayout: 40.0,
    sector: "Financial Services", marketCap: "₹3.3L Cr",
    week52High: 1950, week52Low: 1280,
    revenueGrowth: [7.5, 8.8, 10.2, 11.5, 13.8, 12.2, 10.5, 11.5],
    profitGrowth: [9.2, 11.5, 14.2, 18.5, 23.2, 16.5, 12.8, 14.5],
    peHistory: [22.5, 21.8, 20.5, 19.8, 19.2, 18.8, 18.5, 18.5],
    opmHistory: [40.5, 41.2, 42.5, 43.2, 43.5, 42.8, 42.5, 42.8],
    trends: { salesGrowth: 11.5, peTrend: "stable", opmTrend: "stable" }  },
  MARUTI: {
    symbol: "MARUTI", companyName: "Maruti Suzuki",
    currentSales: 145000, currentOPM: 10.5, currentPE: 26.0, currentEPS: 285.0,
    currentPrice: 7410.0, currentDividendPayout: 35.0,
    sector: "Automobile", marketCap: "₹2.8L Cr",
    week52High: 8500, week52Low: 5200,
    revenueGrowth: [5.2, 6.5, 8.2, 10.5, 12.8, 9.5, 7.2, 8.2],
    profitGrowth: [3.5, 5.2, 7.8, 11.2, 15.5, 8.5, 5.2, 6.8],
    peHistory: [28.5, 27.8, 27.2, 26.8, 26.5, 26.2, 26.0, 26.0],
    opmHistory: [9.2, 9.5, 9.8, 10.2, 10.8, 10.5, 10.2, 10.5],
    trends: { salesGrowth: 8.2, peTrend: "stable", opmTrend: "stable" }  },
  HINDUNILVR: {
    symbol: "HINDUNILVR", companyName: "Hindustan Unilever",
    currentSales: 62000, currentOPM: 24.5, currentPE: 28.0, currentEPS: 48.0,
    currentPrice: 1344.0, currentDividendPayout: 95.0,
    sector: "Fast Moving Consumer Goods", marketCap: "₹3.1L Cr",
    week52High: 1520, week52Low: 1050,
    revenueGrowth: [2.5, 3.2, 4.2, 5.5, 7.2, 5.2, 3.8, 4.2],
    profitGrowth: [1.8, 2.5, 3.8, 5.2, 7.5, 4.5, 3.2, 3.8],
    peHistory: [25.2, 25.8, 26.5, 27.2, 27.8, 28.2, 28.5, 28.0],
    opmHistory: [23.5, 23.8, 24.2, 24.5, 24.8, 24.5, 24.2, 24.5],
    trends: { salesGrowth: 4.2, peTrend: "increasing", opmTrend: "stable" }  },
  ICICIBANK: {
    symbol: "ICICIBANK", companyName: "ICICI Bank",
    currentSales: 125000, currentOPM: 40.2, currentPE: 16.5, currentEPS: 72.0,
    currentPrice: 1188.0, currentDividendPayout: 50.0,
    sector: "Financial Services", marketCap: "₹4.1L Cr",
    week52High: 1380, week52Low: 850,
    revenueGrowth: [7.5, 9.2, 11.5, 13.8, 16.2, 14.5, 11.8, 12.8],
    profitGrowth: [9.5, 12.2, 15.8, 20.5, 26.2, 18.5, 14.2, 16.5],
    peHistory: [20.5, 19.2, 18.5, 17.8, 17.2, 16.8, 16.5, 16.5],
    opmHistory: [38.2, 39.2, 40.5, 41.2, 42.5, 40.2, 40.0, 40.2],
    trends: { salesGrowth: 12.8, peTrend: "declining", opmTrend: "stable" }  },
  ASIANPAINT: {
    symbol: "ASIANPAINT", companyName: "Asian Paints",
    currentSales: 35000, currentOPM: 18.2, currentPE: 42.0, currentEPS: 42.0,
    currentPrice: 1764.0, currentDividendPayout: 55.0,
    sector: "Consumer Discretionary", marketCap: "₹1.7L Cr",
    week52High: 2050, week52Low: 1250,
    revenueGrowth: [3.5, 4.8, 6.5, 8.2, 10.5, 7.8, 5.5, 6.5],
    profitGrowth: [2.2, 3.8, 5.5, 7.8, 11.2, 6.5, 4.2, 5.2],
    peHistory: [35.2, 36.8, 38.5, 40.2, 41.5, 42.8, 43.2, 42.0],
    opmHistory: [16.5, 17.2, 17.8, 18.2, 18.8, 18.5, 18.2, 18.2],
    trends: { salesGrowth: 6.5, peTrend: "increasing", opmTrend: "stable" }  },
  WIPRO: {
    symbol: "WIPRO", companyName: "Wipro",
    currentSales: 92000, currentOPM: 17.5, currentPE: 22.0, currentEPS: 42.0,
    currentPrice: 924.0, currentDividendPayout: 70.0,
    sector: "Information Technology", marketCap: "₹2.1L Cr",
    week52High: 1150, week52Low: 680,
    revenueGrowth: [1.5, 2.2, 3.5, 4.8, 6.2, 4.2, 2.8, 3.5],
    profitGrowth: [0.8, 1.5, 2.8, 4.2, 6.5, 3.5, 2.2, 2.8],
    peHistory: [24.5, 24.2, 23.8, 23.2, 22.8, 22.5, 22.2, 22.0],
    opmHistory: [16.5, 16.8, 17.2, 17.5, 17.8, 17.5, 17.2, 17.5],
    trends: { salesGrowth: 3.5, peTrend: "stable", opmTrend: "stable"  },
  },
  HDFC: {
    symbol: "HDFC", companyName: "Housing Development Finance Corp",
    currentSales: 85000, currentOPM: 35.2, currentPE: 20.0, currentEPS: 95.0,
    currentPrice: 1900.0, currentDividendPayout: 30.0,
    sector: "Financial Services", marketCap: "₹3.6L Cr",
    week52High: 2250, week52Low: 1450,
    revenueGrowth: [6.5, 7.8, 9.2, 10.5, 12.8, 11.2, 9.5, 10.2],
    profitGrowth: [8.2, 10.5, 13.2, 16.5, 20.2, 14.8, 11.5, 12.8],
    peHistory: [22.5, 21.8, 21.2, 20.8, 20.5, 20.2, 20.0, 20.0],
    opmHistory: [33.5, 34.2, 34.8, 35.2, 35.5, 35.2, 35.0, 35.2],
    trends: { salesGrowth: 10.2, peTrend: "stable", opmTrend: "stable"  },
  }
};

export function loadStockData(symbol: string): StockData | null {
  const upperSymbol = symbol.toUpperCase();
  
  if (csvCache.has(upperSymbol)) {
    return csvCache.get(upperSymbol)!;
  }
  
  const hardcoded = STOCK_FUNDAMENTALS[upperSymbol];
  if (hardcoded) {
    return { ...hardcoded, dataSource: "hardcoded" };
  }
  
  return null;
}

function buildFromFinnhub(symbol: string, result: import("./finnhub-proxy").FinnhubResult): StockData | null {
  const { profile, metric } = result;
  if (!metric?.peTTM && !metric?.epsTTM) return null;

  const name = profile?.name || symbol;
  const sector = profile?.sector || "Other";
  const mc = profile?.marketCap
    ? `₹${(profile.marketCap / 100).toFixed(1)}L Cr`
    : "N/A";

  const currentPE = metric.peTTM || 0;
  const currentEPS = metric.epsTTM || 0;
  const currentDividend = metric.dividendYield
    ? parseFloat((metric.dividendYield * 100).toFixed(1))
    : 0;
  const currentOPM = metric.operatingMargin
    ? parseFloat((metric.operatingMargin * 100).toFixed(1))
    : 0;
  const currentPrice = 0;
  const week52High = metric.high52 || 0;
  const week52Low = metric.low52 || 0;

  return {
    symbol,
    companyName: name,
    currentSales: metric.revenueTTM || 0,
    currentOPM,
    currentPE,
    currentEPS,
    currentPrice,
    currentDividendPayout: currentDividend,
    sector,
    marketCap: mc,
    week52High: Math.round(week52High),
    week52Low: Math.round(week52Low),
    revenueGrowth: metric.revenueGrowth ? [metric.revenueGrowth] : [],
    profitGrowth: [],
    peHistory: [currentPE],
    opmHistory: currentOPM > 0 ? [currentOPM] : [],
    trends: {
      salesGrowth: metric.revenueGrowth || 0,
      peTrend: "stable",
      opmTrend: "stable",
    },
    dataSource: "finnhub",
  };
}

export async function loadStockDataAsync(symbol: string): Promise<StockData | null> {
  const upperSymbol = symbol.toUpperCase();
  
  if (csvCache.has(upperSymbol)) {
    return csvCache.get(upperSymbol)!;
  }
  
  const csvData = await loadFromCSV(upperSymbol);
  if (csvData) {
    return csvData;
  }

  const hardcoded = STOCK_FUNDAMENTALS[upperSymbol];
  if (hardcoded) {
    return { ...hardcoded, dataSource: "hardcoded" };
  }

  try {
    const finnhubResult = await fetchFinnhubData({ data: { ticker: upperSymbol } });
    if (finnhubResult && !finnhubResult.error) {
      const built = buildFromFinnhub(upperSymbol, finnhubResult);
      if (built) {
        csvCache.set(upperSymbol, built);
        return built;
      }
    }
  } catch (e) {
    console.warn(`[stockData] Finnhub fetch failed for ${upperSymbol}:`, e);
  }

  return null;
}

export async function preloadAllStockData(): Promise<void> {
  const tickers = Object.keys(STOCK_CONFIG);
  
  console.log("[stockData] Preloading fundamentals from CSV for", tickers.length, "stocks...");
  
  const promises = tickers.map(async (ticker) => {
    const data = await loadFromCSV(ticker);
    if (data) {
      console.log(`[stockData] ✓ Loaded ${ticker} from CSV`);
    } else {
      console.log(`[stockData] ○ Using hardcoded for ${ticker}`);
    }
  });
  
  await Promise.all(promises);
  console.log("[stockData] Preload complete. CSV cache size:", csvCache.size);
}

export function getStockScore(data: StockData): number {
  let score = 45;
  
  if (data.trends.salesGrowth > 20) score += 12;
  else if (data.trends.salesGrowth > 15) score += 10;
  else if (data.trends.salesGrowth > 10) score += 7;
  else if (data.trends.salesGrowth > 5) score += 3;
  else if (data.trends.salesGrowth < 0) score -= 8;
  
  if (data.currentOPM > 50) score += 10;
  else if (data.currentOPM > 40) score += 8;
  else if (data.currentOPM > 25) score += 5;
  else if (data.currentOPM > 15) score += 2;
  else if (data.currentOPM < 10) score -= 5;
  
  if (data.currentPE < 12) score += 12;
  else if (data.currentPE < 18) score += 8;
  else if (data.currentPE < 25) score += 4;
  else if (data.currentPE < 35) score -= 5;
  else if (data.currentPE > 40) score -= 10;
  
  if (data.trends.peTrend === "declining") score += 8;
  else if (data.trends.peTrend === "stable") score += 3;
  else if (data.trends.peTrend === "increasing") score -= 5;
  
  if (data.currentDividendPayout > 70) score += 3;
  else if (data.currentDividendPayout > 40) score += 2;
  else if (data.currentDividendPayout < 20) score -= 2;
  
  const recentRevGrowth = data.revenueGrowth?.slice(-3).reduce((a, b) => a + b, 0) / 3 || 0;
  if (recentRevGrowth > 15) score += 5;
  else if (recentRevGrowth > 10) score += 3;
  else if (recentRevGrowth < 3) score -= 3;
  
  const rawScore = Math.max(0, Math.min(100, score));
  const normalizedScore = Math.round(rawScore * 0.95);
  
  if (normalizedScore >= 95) return 95;
  if (normalizedScore >= 90) return 90;
  if (normalizedScore >= 85) return 85;
  
  return normalizedScore;
}

export function getSignalLabel(score: number): "buy" | "hold" | "sell" {
  if (score >= 70) return "buy";
  if (score >= 45) return "hold";
  return "sell";
}

export function getAIInsight(symbol: string): string {
  const data = loadStockData(symbol);
  if (!data) return "No analysis available";
  
  const score = getStockScore(data);
  const signal = getSignalLabel(score);
  
  let insights = `📊 ${symbol} Analysis\n\n`;
  insights += `🎯 Signal: ${signal.toUpperCase()} (Score: ${score}/100)\n\n`;
  insights += `📈 Key Metrics:\n`;
  insights += `• P/E Ratio: ${data.currentPE.toFixed(1)}x ${getPEComment(data.currentPE)}\n`;
  insights += `• OPM: ${data.currentOPM.toFixed(1)}% ${getOPMComment(data.currentOPM)}\n`;
  insights += `• Sales Growth: ${data.trends.salesGrowth.toFixed(1)}%\n`;
  insights += `• Dividend: ${data.currentDividendPayout.toFixed(0)}%\n\n`;
  
  insights += `📉 Trends:\n`;
  insights += `• P/E Trend: ${data.trends.peTrend}\n`;
  insights += `• Sales Growth: ${data.trends.salesGrowth > 10 ? "Strong" : data.trends.salesGrowth > 5 ? "Moderate" : "Slow"}\n\n`;
  
  if (signal === "buy") {
    insights += `💡 Strong fundamentals with ${data.trends.salesGrowth > 10 ? "high" : "steady"} growth and ${data.currentPE < 25 ? "reasonable" : "premium"} valuation.`;
  } else if (signal === "sell") {
    insights += `💡 High valuation or declining growth. Consider waiting for better entry.`;
  } else {
    insights += `💡 Mixed signals. Monitor for clearer trend before decision.`;
  }
  
  return insights;
}

function getPEComment(pe: number): string {
  if (pe < 15) return "(Undervalued)";
  if (pe < 20) return "(Reasonable)";
  if (pe < 30) return "(Premium)";
  return "(Expensive)";
}

function getOPMComment(opm: number): string {
  if (opm > 40) return "(Excellent)";
  if (opm > 25) return "(Strong)";
  if (opm > 15) return "(Good)";
  return "(Weak)";
}

export function getAllAvailableStocks(): string[] {
  return Object.keys(STOCK_FUNDAMENTALS);
}