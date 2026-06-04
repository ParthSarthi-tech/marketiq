# MarketIQ — Your Smart Stock Guide

A modern web application for Indian stock market analysis, virtual portfolio management, and AI-powered investment research. Built with TanStack Start, Supabase, and the Gemini API.

> **Note:** This repository is shared for portfolio and recruitment demonstration purposes. Viewing the code is permitted; copying, deploying, or redistributing is not. See [LICENSE](./LICENSE).

---

## Overview

MarketIQ helps first-time Indian investors learn stock market concepts through a fully interactive virtual trading environment. Users complete a risk-profiling quiz, receive AI-curated stock picks matched to their profile, build a virtual portfolio, and track performance with live market data.

### Features

- **Smart Stock Screener** — Browse Indian stocks with fundamental data, P/E ratios, OPM trends, and growth metrics
- **AI-Powered Analysis** — Get buy/hold/sell signals with scores out of 100, driven by financial trend analysis and risk-profile matching
- **Virtual Portfolio** — Build and track a paper portfolio with live pricing, sector allocation, P&L tracking, and reset capabilities
- **AI Advisor Chat** — Conversational assistant that understands your portfolio, risk profile, and holdings to answer market questions
- **Real-Time Market Data** — Live quotes via Upstox API, market status indicators, and 52-week high/low tracking
- **Profile-Based Discovery** — Curated stock sets for each risk profile (conservative to aggressive)
- **Transaction History** — Full buy/sell log with search, filter, and clear functionality
- **Queue & Auto-Execute** — Orders placed outside market hours queue and auto-execute when trading opens

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React 19, SSR, file-based routing) |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 + Framer Motion |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini |
| Charts | Lightweight Charts, Recharts |
| 3D | React Three Fiber |
| UI | Radix UI, shadcn-style components |


## Project Structure

```
├── public/
│   └── data/              # (local only) Stock CSV datasets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── app/           # App-specific components
│   │   ├── auth/          # Auth form components
│   │   ├── landing/       # Landing/marketing page components
│   │   └── ui/            # shadcn-style primitives
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities, DB, integrations
│   ├── routes/            # TanStack Start route pages
│   │   ├── app.*.tsx      # Authenticated app routes
│   │   ├── *.tsx          # Landing/marketing routes
│   │   └── __root.tsx     # Root layout
│   └── styles.css         # Global styles
├── supabase/
│   └── migrations/        # (local only) DB schema
├── .env.example           # Environment variable template
└── package.json
```

---

## License

All Rights Reserved. See [LICENSE](./LICENSE) for details.
