import { MARKET_REQUEST_TIMEOUT_MS, MAX_MARKET_RETRIES } from '@/app/constants';
import type { MarketQuote } from '@/app/types';

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
}

const baseUrl = process.env.MARKET_DATA_BASE_URL || 'https://query1.finance.yahoo.com';

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_MARKET_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(process.env.MARKET_DATA_TIMEOUT_MS || MARKET_REQUEST_TIMEOUT_MS));
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
          lastError = new Error(`Provider returned ${response.status}`);
          continue;
        }
        throw new Error(`Provider returned ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_MARKET_RETRIES) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    } finally { clearTimeout(timer); }
  }
  throw lastError instanceof Error ? lastError : new Error('Market provider request failed');
}

interface ChartResponse { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number } }> } }
interface SummaryResponse {
  quoteSummary?: { result?: Array<{ defaultKeyStatistics?: { trailingPE?: { raw?: number }; forwardPE?: { raw?: number } }; financialData?: { trailingEps?: { raw?: number } } }> };
}

export class YahooFinanceProvider implements MarketDataProvider {
  async getQuote(symbol: string): Promise<MarketQuote> {
    const timestamp = new Date().toISOString();
    try {
      const [chart, summary] = await Promise.all([
        fetchJson<ChartResponse>(`${baseUrl}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`),
        fetchJson<SummaryResponse>(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=defaultKeyStatistics,financialData`),
      ]);
      const cmp = chart.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
      const stats = summary.quoteSummary?.result?.[0];
      const peRatio = stats?.defaultKeyStatistics?.trailingPE?.raw ?? stats?.defaultKeyStatistics?.forwardPE?.raw ?? null;
      const latestEarnings = stats?.financialData?.trailingEps?.raw ?? null;
      if (cmp === null && peRatio === null && latestEarnings === null) throw new Error('No usable market data returned');
      return { symbol, cmp, peRatio, latestEarnings, timestamp, source: 'yahoo-finance' };
    } catch (error) {
      return { symbol, cmp: null, peRatio: null, latestEarnings: null, timestamp, source: 'yahoo-finance', error: error instanceof Error ? error.message : 'Unknown provider error' };
    }
  }
}
