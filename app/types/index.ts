export type Exchange = 'NSE' | 'BSE' | 'UNKNOWN';

export interface Holding {
  id: string;
  stockName: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  marketSymbol?: string;
  sourceCmp: number | null;
  sourcePeRatio: number | null;
  sourceLatestEarnings: number | null;
  sector: string;
}

export interface MarketQuote {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  timestamp: string;
  source: 'yahoo-finance' | 'workbook-fallback';
  stale?: boolean;
  error?: string;
}

export interface PortfolioHolding extends Holding {
  investment: number;
  portfolioPercentage: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  marketDataStatus: 'live' | 'fallback' | 'unavailable';
  marketDataError?: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  gainLoss: number | null;
  returnPercentage: number | null;
  holdingsCount: number;
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalReturnPercentage: number | null;
  holdingsCount: number;
  lastUpdated: string | null;
}

export interface PortfolioResponse {
  success: true;
  data: {
    holdings: Holding[];
    summary: { totalInvestment: number; holdingsCount: number };
  };
  timestamp: string;
}

export interface MarketDataResponse {
  success: true;
  data: MarketQuote[];
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}
