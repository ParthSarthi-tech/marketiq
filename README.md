# MarketIQ — Your Smart Stock Guide

**MarketIQ** is a modern web application for Indian stock market analysis, virtual portfolio management, and intelligent investment research. Built with TanStack Start, it delivers real-time market insights, fundamental data analysis, and AI-powered stock scoring.

## Features

- **Smart Stock Screener** — Browse  Indian stocks with fundamental data, P/E ratios, OPM trends, and growth metrics
- **AI-Powered Analysis** — Get buy/hold/sell signals with scores out of 100, powered by financial trend analysis
- **Virtual Portfolio** — Build and track a paper portfolio with live pricing, sector allocation, and P&L tracking
- **Real-Time Market Data** — Live quotes via Upstox API, 52-week highs/lows, and market status indicators
- **3D Visualizations** — Interactive 3D market landscape with React Three Fiber
- **Advanced Charts** — Performance tracking with lightweight charts and Recharts integration
- **CSV Data Import** — Stock fundamentals loaded from structured CSV files for 17 major Indian companies

## Tech Stack

- **Framework:** TanStack Start (React 19, SSR)
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **APIs:** Gemini AI, Upstox, Finnhub
- **Charts:** Lightweight Charts, Recharts, React Three Fiber
- **UI Components:** Radix UI, shadcn-style components

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd marketiq-your-smart-stock-guide

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `FINNHUB_API_KEY` | Finnhub stock data API key |
| `VITE_SUPABASE_*` | Client-side Supabase config |
| `VITE_UPSTOX_ACCESS_TOKEN` | Upstox API token for live quotes |

## Project Structure

```
├── public/
│   └── data/               # Stock CSV data files
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities (stock data, DB, auth)
│   ├── routes/             # TanStack Start route pages
│   └── styles.css          # Global styles
├── .env.example            # Environment template
└── package.json
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier formatting |

## License

MIT
