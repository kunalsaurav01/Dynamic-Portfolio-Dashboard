# Challenges and Solutions

## Challenge 1 — Unofficial Financial APIs

**Problem:** The assignment itself notes that Yahoo Finance and Google Finance require unofficial access or scraping.

**Solution:** Use an isolated `MarketDataProvider` abstraction and Yahoo unofficial endpoints for quotes and fundamentals. A future licensed provider can replace the adapter without changing the dashboard.

**Trade-off:** Unofficial endpoints may break or rate-limit. The system therefore has fallback values and visible status states.

## Challenge 2 — Rate Limiting

**Problem:** Refreshing every 15 seconds could multiply external requests.

**Solution:** Server-side TTL caching, unique-symbol batching, in-flight promise deduplication, bounded retries and timeouts.

## Challenge 3 — Real-Time Updates

**Problem:** Browser intervals can overlap and survive component lifecycle changes if implemented carelessly.

**Solution:** A single interval is created after holdings are loaded, requests are guarded by a refresh lock, and cleanup clears both the interval and AbortController.

## Challenge 4 — Missing Data

**Problem:** A provider may return price but no fundamentals, or fail for one symbol.

**Solution:** Every market field is nullable. The UI displays `N/A` and preserves workbook values where available instead of crashing.

## Challenge 5 — Performance

**Problem:** A 29-holding portfolio should not issue unnecessary repeated calls.

**Solution:** The browser sends a unique symbol list to one route; the service deduplicates each symbol and caches results.

## Challenge 6 — Security

**Problem:** Direct browser-to-provider calls can expose configuration and create uncontrolled traffic.

**Solution:** External requests happen in Node.js Route Handlers. Inputs are validated with Zod and internal provider errors are not returned to users.

## Challenge 7 — Responsive Table

**Problem:** Eleven required columns are too wide for a phone.

**Solution:** Keep the table semantically intact and provide horizontal scrolling on small screens while summary cards and charts stack responsively.
