import { NextResponse } from 'next/server';
import { getPortfolioHoldings } from '@/app/lib/services/portfolio-service';
import type { ApiErrorResponse, PortfolioResponse } from '@/app/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const holdings = getPortfolioHoldings();
    const totalInvestment = holdings.reduce((sum, h) => sum + h.purchasePrice * h.quantity, 0);
    const body: PortfolioResponse = {
      success: true,
      data: { holdings, summary: { totalInvestment, holdingsCount: holdings.length } },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const body: ApiErrorResponse = { success: false, error: { code: 'PORTFOLIO_LOAD_FAILED', message: 'Portfolio data could not be loaded.' } };
    console.error('[portfolio] failed', error);
    return NextResponse.json(body, { status: 500 });
  }
}
