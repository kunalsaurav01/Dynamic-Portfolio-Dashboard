import type { MarketQuote } from '@/app/types';

interface CacheEntry { value: MarketQuote; expiresAt: number; }
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<MarketQuote>>();

export function getCachedMarketData(symbol: string): MarketQuote | null {
  const entry = cache.get(symbol);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) { cache.delete(symbol); return null; }
  return entry.value;
}

export function setCachedMarketData(symbol: string, value: MarketQuote, ttlMs: number): void {
  cache.set(symbol, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateMarketCache(symbol?: string): void {
  if (symbol) cache.delete(symbol); else cache.clear();
}

export function getInFlight(symbol: string): Promise<MarketQuote> | undefined { return inFlight.get(symbol); }
export function setInFlight(symbol: string, promise: Promise<MarketQuote>): void { inFlight.set(symbol, promise); }
export function clearInFlight(symbol: string): void { inFlight.delete(symbol); }

export function cacheStats() { return { entries: cache.size, inFlight: inFlight.size }; }
