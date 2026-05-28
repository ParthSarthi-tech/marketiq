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
  featured?: boolean;
}

export const STOCK_CONFIG: Record<string, StockConfig> = {
  TCS: {
    ticker: "TCS", name: "Tata Consultancy Services Ltd",
    csvFile: null, instrumentKey: null,
    sector: "Information Technology", marketCap: "₹4.6L Cr",
    thesis: "IT giant with strong domestic presence and AI/Cloud focus.",
    tags: ["growth"], featured: true,
  },
  RELIANCE: {
    ticker: "RELIANCE", name: "Reliance Industries Ltd",
    csvFile: "data/RELIANCE.csv", instrumentKey: null,
    sector: "Energy & Petrochemicals", marketCap: "₹10.2L Cr",
    thesis: "Energy to retail conglomerate. EBITDA growth strong.",
    tags: ["growth", "defensive"], featured: true,
  },
  HDFCBANK: {
    ticker: "HDFCBANK", name: "HDFC Bank Ltd",
    csvFile: "data/HDFCBANK.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹12.5L Cr",
    thesis: "Largest private sector bank. Credit growth robust.",
    tags: ["defensive"], featured: true,
  },
  INFY: {
    ticker: "INFY", name: "Infosys Ltd",
    csvFile: "data/INFY.csv", instrumentKey: null,
    sector: "Information Technology", marketCap: "₹5.4L Cr",
    thesis: "Global IT services leader. AI and cloud transformation play.",
    tags: ["growth"], featured: true,
  },
  ITC: {
    ticker: "ITC", name: "ITC Ltd",
    csvFile: null, instrumentKey: null,
    sector: "FMCG", marketCap: "₹4.5L Cr",
    thesis: "FMCG + hotels + cigarettes. Steady dividend payer.",
    tags: ["defensive"], featured: true,
  },
  LT: {
    ticker: "LT", name: "Larsen & Toubro Ltd",
    csvFile: null, instrumentKey: null,
    sector: "Infrastructure", marketCap: "₹3.6L Cr",
    thesis: "Largest infra play. Capex cycle + order book at all-time high.",
    tags: ["growth", "momentum"], featured: true,
  },
  SBIN: {
    ticker: "SBIN", name: "State Bank of India",
    csvFile: "data/SBIN.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹6.5L Cr",
    thesis: "Largest PSU bank. Market share gains + NIM improvement.",
    tags: ["defensive"], featured: true,
  },
  BAJFINANCE: {
    ticker: "BAJFINANCE", name: "Bajaj Finance Ltd",
    csvFile: "data/BAJFINANCE.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹4.3L Cr",
    thesis: "NBFC leader. Strong asset quality and growth.",
    tags: ["momentum"], featured: true,
  },
  TITAN: {
    ticker: "TITAN", name: "Titan Company Ltd",
    csvFile: "data/TITAN.csv", instrumentKey: null,
    sector: "Consumer Durables", marketCap: "₹1.3L Cr",
    thesis: "Jewellery dominance + wedding season tailwinds.",
    tags: ["growth"], featured: true,
  },
  ADANIPORTS: {
    ticker: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd",
    csvFile: "data/ADANIPORTS.csv", instrumentKey: null,
    sector: "Services", marketCap: "₹3.0L Cr",
    thesis: "India's largest private port operator. Cargo volumes up.",
    tags: ["momentum"], featured: true,
  },
  SUNPHARMA: {
    ticker: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd",
    csvFile: "data/SUNPHARMA.csv", instrumentKey: null,
    sector: "Healthcare", marketCap: "₹3.5L Cr",
    thesis: "Specialty pharma leader. US FDA pipeline improving.",
    tags: ["defensive"], featured: true,
  },
  BHARTIARTL: {
    ticker: "BHARTIARTL", name: "Bharti Airtel Ltd",
    csvFile: null, instrumentKey: null,
    sector: "Telecommunication", marketCap: "₹2.4L Cr",
    thesis: "Telecom leader. ARPU expansion and 5G monetisation.",
    tags: ["growth", "defensive"], featured: true,
  },
  AXISBANK: {
    ticker: "AXISBANK", name: "Axis Bank Ltd",
    csvFile: "data/AXISBANK.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹3.7L Cr",
    thesis: "Private sector bank. Credit growth + improving NIMs.",
    tags: ["defensive"], featured: true,
  },
  KOTAKBANK: {
    ticker: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd",
    csvFile: "data/KOTAKBANK.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹3.3L Cr",
    thesis: "Premium private bank. Strong liability franchise.",
    tags: ["defensive"], featured: true,
  },
  MARUTI: {
    ticker: "MARUTI", name: "Maruti Suzuki India Ltd",
    csvFile: "data/MARUTI.csv", instrumentKey: null,
    sector: "Automobile", marketCap: "₹2.8L Cr",
    thesis: "Market leader in passenger vehicles. Export growth.",
    tags: ["growth"], featured: true,
  },
  HINDUNILVR: {
    ticker: "HINDUNILVR", name: "Hindustan Unilever Ltd",
    csvFile: "data/HINDUNILVR.csv", instrumentKey: null,
    sector: "FMCG", marketCap: "₹3.1L Cr",
    thesis: "FMCG conglomerate. Strong brands and distribution.",
    tags: ["defensive"], featured: true,
  },
  ICICIBANK: {
    ticker: "ICICIBANK", name: "ICICI Bank Ltd",
    csvFile: "data/ICICIBANK.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "₹4.1L Cr",
    thesis: "Private sector bank. Digital initiatives leading growth.",
    tags: ["defensive"], featured: true,
  },
  ASIANPAINT: {
    ticker: "ASIANPAINT", name: "Asian Paints Ltd",
    csvFile: "data/ASIANPAINT.csv", instrumentKey: null,
    sector: "Consumer Discretionary", marketCap: "₹1.7L Cr",
    thesis: "Decorative paints leader. Brand power and distribution.",
    tags: ["growth"], featured: true,
  },
  WIPRO: {
    ticker: "WIPRO", name: "Wipro Ltd",
    csvFile: "data/WIPRO.csv", instrumentKey: null,
    sector: "Information Technology", marketCap: "₹2.1L Cr",
    thesis: "IT services company. Strategic turnaround underway.",
    tags: ["growth"], featured: true,
  },
  HDFC: {
    ticker: "HDFC", name: "Housing Development Finance Corp",
    csvFile: null, instrumentKey: null,
    sector: "Financial Services", marketCap: "₹3.6L Cr",
    thesis: "India's largest housing finance company. Strong asset quality.",
    tags: ["defensive"], featured: true,
  },
  LTFOODS: {
    ticker: "LTFOODS", name: "LT Foods Ltd",
    csvFile: "data/LTFOODS.csv", instrumentKey: null,
    sector: "FMCG", marketCap: "₹6,500 Cr",
    thesis: "Premium rice and food products brand. Strong export presence.",
    tags: ["defensive"], featured: false,
  },
  JSWENERGY: {
    ticker: "JSWENERGY", name: "JSW Energy Ltd",
    csvFile: null, instrumentKey: null,
    sector: "Energy", marketCap: "₹1.2L Cr",
    thesis: "Leading private power producer. Renewable energy transition play.",
    tags: ["growth", "momentum"], featured: false,
  },
  ABFRL: {
    ticker: "ABFRL", name: "Aditya Birla Fashion & Retail Ltd",
    csvFile: "data/ABFRL.csv", instrumentKey: null,
    sector: "Consumer Discretionary", marketCap: "N/A",
    thesis: "India's largest pure-play fashion retailer.",
    tags: ["growth"], featured: false,
  },
  ADANIGREEN: {
    ticker: "ADANIGREEN", name: "Adani Green Energy Ltd",
    csvFile: "data/ADANIGREEN.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "India's largest renewable energy company.",
    tags: ["momentum"], featured: false,
  },
  ADANIPOWER: {
    ticker: "ADANIPOWER", name: "Adani Power Ltd",
    csvFile: "data/ADANIPOWER.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "Leading private thermal power producer.",
    tags: ["momentum"], featured: false,
  },
  AKUMS: {
    ticker: "AKUMS", name: "Akums Drugs & Pharmaceuticals Ltd",
    csvFile: "data/AKUMS.csv", instrumentKey: null,
    sector: "Healthcare", marketCap: "N/A",
    thesis: "Leading contract development and manufacturing pharma company.",
    tags: ["growth"], featured: false,
  },
  "ARE&M": {
    ticker: "ARE&M", name: "Amara Raja Energy & Mobility Ltd",
    csvFile: "data/AREAM.csv", instrumentKey: null,
    sector: "Automobile", marketCap: "N/A",
    thesis: "Leading industrial and automotive battery manufacturer.",
    tags: ["defensive"], featured: false,
  },
  ASMTECH: {
    ticker: "ASMTECH", name: "ASM Technologies Ltd",
    csvFile: "data/ASMTECH.csv", instrumentKey: null,
    sector: "Information Technology", marketCap: "N/A",
    thesis: "IT services and engineering solutions provider.",
    tags: ["growth"], featured: false,
  },
  BALRAMCHIN: {
    ticker: "BALRAMCHIN", name: "Balrampur Chini Mills Ltd",
    csvFile: "data/BALRAMCHIN.csv", instrumentKey: null,
    sector: "FMCG", marketCap: "N/A",
    thesis: "One of India's largest sugar manufacturers.",
    tags: ["defensive"], featured: false,
  },
  BANKBARODA: {
    ticker: "BANKBARODA", name: "Bank of Baroda",
    csvFile: "data/BANKBARODA.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Second largest PSU bank with strong international presence.",
    tags: ["defensive"], featured: false,
  },
  BERGEPAINT: {
    ticker: "BERGEPAINT", name: "Berger Paints India Ltd",
    csvFile: "data/BERGEPAINT.csv", instrumentKey: null,
    sector: "Consumer Discretionary", marketCap: "N/A",
    thesis: "India's second largest paints company.",
    tags: ["growth"], featured: false,
  },
  BIL: {
    ticker: "BIL", name: "Bhartiya International Ltd",
    csvFile: "data/BIL.csv", instrumentKey: null,
    sector: "Consumer Discretionary", marketCap: "N/A",
    thesis: "Leading fashion and leather goods exporter.",
    tags: ["growth"], featured: false,
  },
  BLS: {
    ticker: "BLS", name: "BLS International Services Ltd",
    csvFile: "data/BLS.csv", instrumentKey: null,
    sector: "Services", marketCap: "N/A",
    thesis: "Global leader in visa and passport outsourcing services.",
    tags: ["growth"], featured: false,
  },
  BPCL: {
    ticker: "BPCL", name: "Bharat Petroleum Corporation Ltd",
    csvFile: "data/BPCL.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "Leading downstream oil & gas PSU with strong marketing network.",
    tags: ["defensive"], featured: false,
  },
  BRITANNIA: {
    ticker: "BRITANNIA", name: "Britannia Industries Ltd",
    csvFile: "data/BRITANNIA.csv", instrumentKey: null,
    sector: "FMCG", marketCap: "N/A",
    thesis: "India's leading biscuit and bakery brand.",
    tags: ["defensive"], featured: false,
  },
  CANBK: {
    ticker: "CANBK", name: "Canara Bank",
    csvFile: "data/CANBK.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Major public sector bank with pan-India presence.",
    tags: ["defensive"], featured: false,
  },
  COALINDIA: {
    ticker: "COALINDIA", name: "Coal India Ltd",
    csvFile: "data/COALINDIA.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "World's largest coal mining company. Monopoly supplier.",
    tags: ["defensive"], featured: false,
  },
  COCHINSHIP: {
    ticker: "COCHINSHIP", name: "Cochin Shipyard Ltd",
    csvFile: "data/COCHINSHIP.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "India's largest shipbuilding and maintenance facility.",
    tags: ["momentum"], featured: false,
  },
  DEEPAKFERT: {
    ticker: "DEEPAKFERT", name: "Deepak Fertilisers & Petrochemicals Corp",
    csvFile: "data/DEEPAKFERT.csv", instrumentKey: null,
    sector: "Chemicals", marketCap: "N/A",
    thesis: "Leading private sector fertiliser and chemicals manufacturer.",
    tags: ["defensive"], featured: false,
  },
  EXIDEIND: {
    ticker: "EXIDEIND", name: "Exide Industries Ltd",
    csvFile: "data/EXIDEIND.csv", instrumentKey: null,
    sector: "Automobile", marketCap: "N/A",
    thesis: "India's largest lead-acid battery manufacturer.",
    tags: ["defensive"], featured: false,
  },
  FINEORG: {
    ticker: "FINEORG", name: "Fine Organic Industries Ltd",
    csvFile: "data/FINEORG.csv", instrumentKey: null,
    sector: "Chemicals", marketCap: "N/A",
    thesis: "Speciality chemical manufacturer with strong global presence.",
    tags: ["growth"], featured: false,
  },
  GESHIP: {
    ticker: "GESHIP", name: "Great Eastern Shipping Co Ltd",
    csvFile: "data/GESHIP.csv", instrumentKey: null,
    sector: "Services", marketCap: "N/A",
    thesis: "India's largest private shipping company.",
    tags: ["momentum"], featured: false,
  },
  GRSE: {
    ticker: "GRSE", name: "Garden Reach Shipbuilders & Engineers Ltd",
    csvFile: "data/GRSE.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "Leading defence shipbuilder with strong order book.",
    tags: ["momentum"], featured: false,
  },
  HAL: {
    ticker: "HAL", name: "Hindustan Aeronautics Ltd",
    csvFile: "data/HAL.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "India's premier defence aerospace company.",
    tags: ["momentum"], featured: false,
  },
  HINDALCO: {
    ticker: "HINDALCO", name: "Hindalco Industries Ltd",
    csvFile: "data/HINDALCO.csv", instrumentKey: null,
    sector: "Metals & Mining", marketCap: "N/A",
    thesis: "World's largest aluminium rolling company by volume.",
    tags: ["momentum"], featured: false,
  },
  HSCL: {
    ticker: "HSCL", name: "Himadri Speciality Chemical Ltd",
    csvFile: "data/HSCL.csv", instrumentKey: null,
    sector: "Chemicals", marketCap: "N/A",
    thesis: "Leading speciality chemicals manufacturer for lithium-ion batteries.",
    tags: ["growth"], featured: false,
  },
  INDIANB: {
    ticker: "INDIANB", name: "Indian Bank",
    csvFile: "data/INDIANB.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Major public sector bank with strong southern presence.",
    tags: ["defensive"], featured: false,
  },
  IRCTC: {
    ticker: "IRCTC", name: "Indian Railway Catering & Tourism Corp",
    csvFile: "data/IRCTC.csv", instrumentKey: null,
    sector: "Services", marketCap: "N/A",
    thesis: "Monopoly provider of railway ticketing and catering.",
    tags: ["momentum"], featured: false,
  },
  IRFC: {
    ticker: "IRFC", name: "Indian Railway Finance Corp",
    csvFile: "data/IRFC.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Dedicated financing arm of Indian Railways.",
    tags: ["defensive"], featured: false,
  },
  JIOFIN: {
    ticker: "JIOFIN", name: "Jio Financial Services Ltd",
    csvFile: "data/JIOFIN.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Reliance group's financial services arm. Digital lending play.",
    tags: ["momentum"], featured: false,
  },
  JSWSTEEL: {
    ticker: "JSWSTEEL", name: "JSW Steel Ltd",
    csvFile: "data/JSWSTEEL.csv", instrumentKey: null,
    sector: "Metals & Mining", marketCap: "N/A",
    thesis: "India's leading integrated steel manufacturer.",
    tags: ["momentum"], featured: false,
  },
  KAYNES: {
    ticker: "KAYNES", name: "Kaynes Technology India Ltd",
    csvFile: "data/KAYNES.csv", instrumentKey: null,
    sector: "Information Technology", marketCap: "N/A",
    thesis: "Leading electronics manufacturing services company.",
    tags: ["growth"], featured: false,
  },
  LICHSGFIN: {
    ticker: "LICHSGFIN", name: "LIC Housing Finance Ltd",
    csvFile: "data/LICHSGFIN.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "India's largest housing finance company by loan portfolio.",
    tags: ["defensive"], featured: false,
  },
  "M&M": {
    ticker: "M&M", name: "Mahindra & Mahindra Ltd",
    csvFile: "data/MM.csv", instrumentKey: null,
    sector: "Automobile", marketCap: "N/A",
    thesis: "Market leader in SUVs and tractors. EV transition play.",
    tags: ["growth"], featured: false,
  },
  MAZDOCK: {
    ticker: "MAZDOCK", name: "Mazagon Dock Shipbuilders Ltd",
    csvFile: "data/MAZDOCK.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "India's leading defence shipyard with major naval contracts.",
    tags: ["momentum"], featured: false,
  },
  MTARTECH: {
    ticker: "MTARTECH", name: "MTAR Technologies Ltd",
    csvFile: "data/MTARTECH.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "Precision engineering for nuclear, space and defence sectors.",
    tags: ["momentum"], featured: false,
  },
  PARAS: {
    ticker: "PARAS", name: "Paras Defence & Space Technologies Ltd",
    csvFile: "data/PARAS.csv", instrumentKey: null,
    sector: "Infrastructure", marketCap: "N/A",
    thesis: "Specialised defence and aerospace components manufacturer.",
    tags: ["momentum"], featured: false,
  },
  PATANJALI: {
    ticker: "PATANJALI", name: "Patanjali Foods Ltd",
    csvFile: "data/PATANJALI.csv", instrumentKey: null,
    sector: "FMCG", marketCap: "N/A",
    thesis: "FMCG powerhouse with strong Ayurvedic and food product portfolio.",
    tags: ["defensive"], featured: false,
  },
  POLYCAB: {
    ticker: "POLYCAB", name: "Polycab India Ltd",
    csvFile: "data/POLYCAB.csv", instrumentKey: null,
    sector: "Consumer Discretionary", marketCap: "N/A",
    thesis: "India's largest wire and cable manufacturer.",
    tags: ["growth"], featured: false,
  },
  RECLTD: {
    ticker: "RECLTD", name: "REC Ltd",
    csvFile: "data/RECLTD.csv", instrumentKey: null,
    sector: "Financial Services", marketCap: "N/A",
    thesis: "Leading NBFC focused on power sector financing.",
    tags: ["defensive"], featured: false,
  },
  SUZLON: {
    ticker: "SUZLON", name: "Suzlon Energy Ltd",
    csvFile: "data/SUZLON.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "India's largest wind turbine manufacturer. Renewable energy play.",
    tags: ["momentum"], featured: false,
  },
  WAAREEENER: {
    ticker: "WAAREEENER", name: "Waaree Energies Ltd",
    csvFile: "data/WAAREEENER.csv", instrumentKey: null,
    sector: "Energy", marketCap: "N/A",
    thesis: "India's largest solar module manufacturer.",
    tags: ["momentum"], featured: false,
  },
  ZENTEC: {
    ticker: "ZENTEC", name: "Zen Technologies Ltd",
    csvFile: "data/ZENTEC.csv", instrumentKey: null,
    sector: "Information Technology", marketCap: "N/A",
    thesis: "India's leading defence training and simulation company.",
    tags: ["momentum"], featured: false,
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

export type RiskProfile = "low" | "med-low" | "med-high" | "high";

export type StockSet = {
  title: string;
  tickers: [string, string, string];
};

export const PROFILE_STOCKS: Record<RiskProfile, StockSet[]> = {
  low: [
    { title: "Blue-Chip Anchors", tickers: ["HDFCBANK", "ITC", "HINDUNILVR"] },
    { title: "Defensive Leaders", tickers: ["SUNPHARMA", "KOTAKBANK", "MARUTI"] },
    { title: "Dividend Income", tickers: ["COALINDIA", "RECLTD", "BRITANNIA"] },
    { title: "Value Plays", tickers: ["ICICIBANK", "SBIN", "TCS"] },
    { title: "Steady Compounders", tickers: ["ASIANPAINT", "TITAN", "AXISBANK"] },
  ],
  "med-low": [
    { title: "Core Holdings", tickers: ["TCS", "HDFCBANK", "ITC"] },
    { title: "Growth & Stability", tickers: ["RELIANCE", "BHARTIARTL", "SBIN"] },
    { title: "Quality Franchises", tickers: ["ASIANPAINT", "TITAN", "MARUTI"] },
    { title: "Sector Leaders", tickers: ["ICICIBANK", "INFY", "WIPRO"] },
    { title: "Financial Strength", tickers: ["KOTAKBANK", "AXISBANK", "SUNPHARMA"] },
  ],
  "med-high": [
    { title: "Growth Drivers", tickers: ["RELIANCE", "INFY", "TCS"] },
    { title: "Financial Powerhouses", tickers: ["HDFCBANK", "ICICIBANK", "BAJFINANCE"] },
    { title: "Consumer Champions", tickers: ["MARUTI", "TITAN", "HINDUNILVR"] },
    { title: "Tech & Innovation", tickers: ["WIPRO", "BHARTIARTL", "LT"] },
    { title: "Emerging Leaders", tickers: ["ADANIPORTS", "AXISBANK", "ITC"] },
  ],
  high: [
    { title: "High Growth", tickers: ["BAJFINANCE", "LT", "ADANIPORTS"] },
    { title: "Momentum Plays", tickers: ["HAL", "IRFC", "SUZLON"] },
    { title: "Infrastructure Boom", tickers: ["JSWSTEEL", "COALINDIA", "RECLTD"] },
    { title: "Next-Gen Leaders", tickers: ["JIOFIN", "IRCTC", "BEL"] },
    { title: "Industrial Powerhouses", tickers: ["POLYCAB", "BERGEPAINT", "M&M"] },
  ],
};

export function getAllTickers(): string[] {
  return Object.keys(STOCK_CONFIG);
}