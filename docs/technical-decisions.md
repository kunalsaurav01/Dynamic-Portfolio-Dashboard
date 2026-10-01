# Technical Decisions

## Market data provider

The assignment explicitly notes that Yahoo Finance and Google Finance do not expose stable official public APIs. Rather than browser scraping, this implementation isolates Yahoo Finance unofficial endpoints behind a provider adapter. Yahoo is used as an alternative source for both price and fundamentals. This keeps provider-specific behavior replaceable and avoids exposing provider calls to the browser.

The trade-off is that unofficial endpoints can change or rate-limit requests. The application therefore includes timeouts, bounded retries, server-side caching, request deduplication, and workbook fallback values.

## 15-second refresh vs cache TTL

The dashboard checks for new market data every 15 seconds because the assignment asks for approximately that cadence. The default external-data cache TTL is 30 seconds to reduce repeated provider calls. These are intentionally separate controls.

## Workbook fallback

The supplied workbook contains a last-known CMP and fundamental values for the holdings. Those values are retained as a graceful fallback. The UI labels whether a row is live, fallback, or unavailable.

## Numeric BSE codes

Some source rows use numeric BSE scrip codes while others contain exchange tickers. The original code is preserved in `exchangeCode`. A separate `marketSymbol` map is used only for external provider lookup so the source data is not silently rewritten.

## Calculations

All portfolio calculations are pure functions. This makes them easy to test and prevents financial logic from becoming coupled to React rendering.

## Client/server boundary

Market providers are accessed only by server-side route handlers. This keeps provider details and any future API credentials off the client.
