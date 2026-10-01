import type { MarketDataResponse, PortfolioResponse } from '@/app/types';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok || body.success === false) throw new Error(body.error?.message || 'Request failed');
  return body as T;
}

export const portfolioApi = {
  get: (signal?: AbortSignal) => getJson<PortfolioResponse>('/api/portfolio', signal),
};

export const marketApi = {
  get: (symbols: string[], signal?: AbortSignal) => getJson<MarketDataResponse>(`/api/market-data?symbols=${encodeURIComponent(symbols.join(','))}`, signal),
};
