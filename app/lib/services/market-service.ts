import { DEFAULT_CACHE_TTL_SECONDS } from '@/app/constants';
import type { MarketQuote } from '@/app/types';
import { getCachedMarketData, getInFlight, setCachedMarketData, setInFlight, clearInFlight } from '@/app/lib/cache/market-cache';
import { YahooFinanceProvider } from '@/app/lib/services/market-data-provider';

const provider = new YahooFinanceProvider();

export async function getMarketData(symbols: string[]): Promise<MarketQuote[]> {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  const ttlMs = Number(process.env.CACHE_TTL_SECONDS || DEFAULT_CACHE_TTL_SECONDS) * 1000;
  return Promise.all(uniqueSymbols.map(async (symbol) => {
    const cached = getCachedMarketData(symbol);
    if (cached) return cached;
    const running = getInFlight(symbol);
    if (running) return running;
    const request = provider.getQuote(symbol).then((value) => {
      setCachedMarketData(symbol, value, ttlMs);
      return value;
    }).finally(() => clearInFlight(symbol));
    setInFlight(symbol, request);
    return request;
  }));
}
