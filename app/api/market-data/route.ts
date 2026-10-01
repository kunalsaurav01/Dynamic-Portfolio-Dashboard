import { NextRequest, NextResponse } from 'next/server';
import { marketSymbolsSchema } from '@/app/lib/validation/schemas';
import { getMarketData } from '@/app/lib/services/market-service';
import type { ApiErrorResponse, MarketDataResponse } from '@/app/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('symbols')?.split(',') ?? [];
  const parsed = marketSymbolsSchema.safeParse({ symbols: raw });
  if (!parsed.success) {
    const body: ApiErrorResponse = { success: false, error: { code: 'INVALID_SYMBOLS', message: 'Provide one or more valid symbols.' } };
    return NextResponse.json(body, { status: 400 });
  }
  try {
    const started = performance.now();
    const data = await getMarketData(parsed.data.symbols);
    console.info(`[market-data] symbols=${data.length} latencyMs=${Math.round(performance.now() - started)}`);
    const body: MarketDataResponse = { success: true, data, timestamp: new Date().toISOString() };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[market-data] failed', error);
    const body: ApiErrorResponse = { success: false, error: { code: 'MARKET_DATA_UNAVAILABLE', message: 'Market data is temporarily unavailable.' } };
    return NextResponse.json(body, { status: 503 });
  }
}
