# Dynamic Portfolio Dashboard

A production-oriented Next.js + TypeScript + Tailwind CSS portfolio dashboard built from the supplied Octa Byte AI case study and portfolio workbook.

## Features

- 29 real holdings loaded from the supplied Excel workbook
- Normalized and runtime-validated portfolio model
- Investment, portfolio weight, present value, gain/loss and return calculations
- CMP, P/E ratio and trailing EPS/earnings adapter
- Server-side market-data access
- 30-second server cache with in-flight request deduplication
- 15-second browser refresh cadence
- Graceful workbook fallback when live data is unavailable
- Sortable responsive portfolio table
- Sector-level summaries with expand/collapse
- Sector allocation, value comparison and gain/loss charts
- Loading, warning, empty and error states
- Accessible status indicators that do not rely only on color
- Unit, integration and E2E test setup

## Architecture

`Browser → Next.js API → Service Layer → Cache → External Market Provider`

See [docs/architecture.md](docs/architecture.md) and [docs/technical-decisions.md](docs/technical-decisions.md).

## Tech Stack

- Next.js 16
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- Recharts
- Zod
- Vitest
- Playwright

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm test
npm run test:e2e
npm run format:check
```

## Environment

```env
MARKET_DATA_BASE_URL=https://query1.finance.yahoo.com
MARKET_DATA_TIMEOUT_MS=7000
CACHE_TTL_SECONDS=30
MARKET_DATA_MAX_RETRIES=2
```

No browser-visible secret is required by the current unofficial Yahoo implementation. If a licensed provider requiring credentials is introduced later, keep its key server-side and never use `NEXT_PUBLIC_` for it.

## Portfolio source

The original workbook is preserved at `data/portfolio/source.xlsx`. The normalized, runtime-consumable representation is generated into `data/portfolio/holdings.json` from that workbook. The JSON is checked by Zod when the portfolio service loads.

## Data source disclaimer

The assignment states that Yahoo Finance and Google Finance do not provide stable official public APIs. This implementation does not pretend otherwise. It uses Yahoo Finance's unofficial endpoints behind a provider adapter for CMP and fundamentals, with bounded retries, caching, and workbook fallback. For production use with financial decision-making, replace the adapter with a licensed market-data provider and validate its terms, latency, coverage and data rights.

## Known limitations

- The current cache is process-local; use Redis for horizontally scaled deployments.
- Unofficial market endpoints can change or become unavailable.
- Workbook values are fallback values, not guaranteed real-time market data.
- Market data can be delayed or unavailable outside provider trading/data windows.

## Technical documentation

- [Architecture](docs/architecture.md)
- [Technical decisions](docs/technical-decisions.md)
- [Challenges and solutions](docs/challenges-and-solutions.md)

## Interview explanation

### 1. Why Next.js?

It gives the project one TypeScript codebase with a React frontend and server-side Route Handlers, so provider calls can remain on the server.

### 2. Why TypeScript?

The portfolio has many numeric and nullable market fields. Strict types make those contracts explicit and reduce runtime mistakes.

### 3. Why API routes instead of browser API calls?

It keeps provider integration server-side, centralizes caching/rate limiting, and prevents the browser from controlling external provider traffic.

### 4. How is market data retrieved?

A `MarketDataProvider` interface isolates Yahoo's unofficial endpoints. CMP comes from the chart endpoint; fundamentals are requested through Yahoo's quote-summary endpoint.

### 5. How are P/E and earnings retrieved?

The adapter reads trailing P/E and trailing EPS from the provider when available. The UI treats them as nullable and displays `N/A` if unavailable.

### 6. How does caching work?

Each symbol has a TTL entry in a server-side Map. Concurrent requests for the same symbol share one in-flight promise, preventing duplicate provider calls.

### 7. Why 15-second refresh?

That cadence is explicitly requested by the assignment. It is implemented as a browser refresh interval, while the provider cache has a longer default TTL to reduce unnecessary external traffic.

### 8. How is rate limiting handled?

Unique-symbol requests, caching, in-flight deduplication, short timeouts and bounded exponential retries reduce provider pressure. A production multi-instance deployment should add a distributed rate limiter/cache.

### 9. How do calculations work?

Investment is purchase price × quantity. Present value is CMP × quantity. Gain/loss is present value − investment, and portfolio weight is investment ÷ total investment.

### 10. How does sector aggregation work?

Holdings are grouped by their workbook sector, then investment and available present values are summed. Return is gain/loss divided by sector investment.

### 11. How are errors handled?

Provider failures are isolated per symbol. Missing fields become `N/A`, while workbook values can be used as a fallback. The whole dashboard does not fail because one stock is unavailable.

### 12. How is the application secured?

Provider calls run only in Node.js Route Handlers, inputs are validated with Zod, and provider internals are not sent to the browser.

### 13. How can it scale?

Replace the in-memory cache with Redis, add a licensed provider with batch endpoints, centralize observability, and move repeated market refreshes toward a server-side polling/streaming architecture.

### 14. What would be improved in a real production environment?

I would use a licensed provider, Redis, structured logging/metrics, centralized rate limiting, authentication/authorization if the dashboard becomes multi-user, and an automated deployment/monitoring pipeline.
