export interface StockConfig {
  ticker: string;
  name: string;
  csvFile: string | null;
  instrumentKey: string | null;
  sector: string;
  marketCap: string;
  thesis: string;
  tags: string[];
  displaySymbol?: string;
}

export const STOCK_CONFIG: Record<string, StockConfig> = {
  INFY: {
    ticker: "INFY",
    name: "Infosys Ltd",
    csvFile: "data/Infosys.csv",
    instrumentKey: null,
    sector: "Information Technology",
    marketCap: "₹5.4L Cr",
    thesis: "Global IT services leader. AI and cloud transformation play.",
    tags: ["growth"],
  },
  HDFCBANK: {
    ticker: "HDFCBANK",
    name: "HDFC Bank Ltd",
    csvFile: "data/HDFC Bank.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹12.5L Cr",
    thesis: "Largest private sector bank. Credit growth robust.",
    tags: ["defensive"],
  },
  RELIANCE: {
    ticker: "RELIANCE",
    name: "Reliance Industries Ltd",
    csvFile: "data/Reliance Industries.csv",
    instrumentKey: null,
    sector: "Energy & Petrochemicals",
    marketCap: "₹10.2L Cr",
    thesis: "Energy to retail conglomerate. EBITDA growth strong.",
    tags: ["growth", "defensive"],
  },
  TCS: {
    ticker: "TCS",
    name: "Tata Consultancy Services Ltd",
    csvFile: "data/TCS.csv",
    instrumentKey: null,
    sector: "Information Technology",
    marketCap: "₹4.6L Cr",
    thesis: "IT giant with strong domestic presence and AI/Cloud focus.",
    tags: ["growth"],
  },
  ITC: {
    ticker: "ITC",
    name: "ITC Ltd",
    csvFile: "data/ITC.csv",
    instrumentKey: null,
    sector: "FMCG",
    marketCap: "₹4.5L Cr",
    thesis: "FMCG + hotels + cigarettes. Steady dividend payer.",
    tags: ["defensive"],
  },
  LTFOODS: {
    ticker: "LTFOODS",
    name: "LT Foods Ltd",
    csvFile: "data/L T Foods.csv",
    instrumentKey: null,
    sector: "FMCG",
    marketCap: "₹6,500 Cr",
    thesis: "Premium rice and food products brand. Strong export presence.",
    tags: ["defensive"],
  },
  SBIN: {
    ticker: "SBIN",
    name: "State Bank of India",
    csvFile: "data/SBI.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹6.5L Cr",
    thesis: "Largest PSU bank. Market share gains + NIM improvement.",
    tags: ["defensive"],
  },
  BAJFINANCE: {
    ticker: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
    csvFile: "data/Bajaj Finance.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹4.3L Cr",
    thesis: "NBFC leader. Strong asset quality and growth.",
    tags: ["momentum"],
  },
  TITAN: {
    ticker: "TITAN",
    name: "Titan Company Ltd",
    csvFile: "data/Titan Company.csv",
    instrumentKey: null,
    sector: "Consumer Durables",
    marketCap: "₹1.3L Cr",
    thesis: "Jewellery dominance + wedding season tailwinds.",
    tags: ["growth"],
  },
  ADANIPORTS: {
    ticker: "ADANIPORTS",
    name: "Adani Ports and Special Economic Zone Ltd",
    csvFile: "data/Adani Ports.csv",
    instrumentKey: null,
    sector: "Services",
    marketCap: "₹3.0L Cr",
    thesis: "India's largest private port operator. Cargo volumes up.",
    tags: ["momentum"],
  },
  SUNPHARMA: {
    ticker: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries Ltd",
    csvFile: "data/Sun Pharma.Inds.csv",
    instrumentKey: null,
    sector: "Healthcare",
    marketCap: "₹3.5L Cr",
    thesis: "Specialty pharma leader. US FDA pipeline improving.",
    tags: ["defensive"],
  },
  BHARTIARTL: {
    ticker: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    csvFile: "data/Bhartiya Intl.csv",
    instrumentKey: null,
    sector: "Telecommunication",
    marketCap: "₹2.4L Cr",
    thesis: "Telecom leader. ARPU expansion and 5G monetisation.",
    tags: ["growth", "defensive"],
  },
  AXISBANK: {
    ticker: "AXISBANK",
    name: "Axis Bank Ltd",
    csvFile: "data/Axis Bank.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹3.7L Cr",
    thesis: "Private sector bank. Credit growth + improving NIMs.",
    tags: ["defensive"],
  },
  KOTAKBANK: {
    ticker: "KOTAKBANK",
    name: "Kotak Mahindra Bank Ltd",
    csvFile: "data/Kotak Mah. Bank.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹3.3L Cr",
    thesis: "Premium private bank. Strong liability franchise.",
    tags: ["defensive"],
  },
  MARUTI: {
    ticker: "MARUTI",
    name: "Maruti Suzuki India Ltd",
    csvFile: "data/Maruti Suzuki.csv",
    instrumentKey: null,
    sector: "Automobile",
    marketCap: "₹2.8L Cr",
    thesis: "Market leader in passenger vehicles. Export growth.",
    tags: ["growth"],
  },
  HINDUNILVR: {
    ticker: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    csvFile: "data/Hind. Unilever.csv",
    instrumentKey: null,
    sector: "FMCG",
    marketCap: "₹3.1L Cr",
    thesis: "FMCG conglomerate. Strong brands and distribution.",
    tags: ["defensive"],
  },
  ICICIBANK: {
    ticker: "ICICIBANK",
    name: "ICICI Bank Ltd",
    csvFile: "data/ICICI Bank.csv",
    instrumentKey: null,
    sector: "Financial Services",
    marketCap: "₹4.1L Cr",
    thesis: "Private sector bank. Digital initiatives leading growth.",
    tags: ["defensive"],
  },
  ASIANPAINT: {
    ticker: "ASIANPAINT",
    name: "Asian Paints Ltd",
    csvFile: "data/Asian Paints.csv",
    instrumentKey: null,
    sector: "Consumer Discretionary",
    marketCap: "₹1.7L Cr",
    thesis: "Decorative paints leader. Brand power and distribution.",
    tags: ["growth"],
  },
  WIPRO: {
    ticker: "WIPRO",
    name: "Wipro Ltd",
    csvFile: "data/Wipro.csv",
    instrumentKey: null,
    sector: "Information Technology",
    marketCap: "₹2.1L Cr",
    thesis: "IT services company. Strategic turnaround underway.",
    tags: ["growth"],
  },
};

export const INDEX_KEYS = {
  NIFTY_50: "NSE_INDEX|Nifty 50",
  NIFTY_BANK: "NSE_INDEX|Nifty Bank",
  NIFTY_IT: "NSE_INDEX|Nifty IT",
  NIFTY_FMCG: "NSE_INDEX|Nifty FMCG",
} as const;

export const INDIAN_STOCKS = Object.values(STOCK_CONFIG).map((s) => ({
  symbol: s.ticker,
  name: s.name,
  sector: s.sector,
}));

export const FILTER_CATEGORIES = [
  { id: "all", label: "All picks" },
  { id: "growth", label: "High growth" },
  { id: "defensive", label: "Defensive" },
  { id: "momentum", label: "Momentum" },
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number]["id"];

export function getStockTags(ticker: string): string[] {
  return STOCK_CONFIG[ticker]?.tags || ["growth"];
}

export function getStockSector(ticker: string): string {
  return STOCK_CONFIG[ticker]?.sector || "Other";
}

export function getStockName(ticker: string): string {
  return STOCK_CONFIG[ticker]?.name || ticker;
}

export function getStockThesis(ticker: string): string {
  return STOCK_CONFIG[ticker]?.thesis || "Strong fundamentals and market position.";
}

export function getCsvFile(ticker: string): string | null {
  return STOCK_CONFIG[ticker]?.csvFile || null;
}

export function getAllTickers(): string[] {
  return Object.keys(STOCK_CONFIG);
}