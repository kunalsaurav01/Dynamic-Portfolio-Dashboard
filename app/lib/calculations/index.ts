import type { Holding, PortfolioHolding, SectorSummary } from '@/app/types';

export function calculateInvestment(purchasePrice: number, quantity: number): number {
  return roundCurrency(purchasePrice * quantity);
}

export function calculatePortfolioWeight(investment: number, totalInvestment: number): number {
  if (!Number.isFinite(totalInvestment) || totalInvestment <= 0) return 0;
  return investment / totalInvestment;
}

export function calculatePresentValue(cmp: number | null, quantity: number): number | null {
  if (cmp === null || !Number.isFinite(cmp) || !Number.isFinite(quantity)) return null;
  return roundCurrency(cmp * quantity);
}

export function calculateGainLoss(presentValue: number | null, investment: number): number | null {
  if (presentValue === null || !Number.isFinite(investment)) return null;
  return roundCurrency(presentValue - investment);
}

export function calculateGainLossPercentage(gainLoss: number | null, investment: number): number | null {
  if (gainLoss === null || !Number.isFinite(investment) || investment === 0) return null;
  return gainLoss / investment;
}

export function calculateSectorSummary(holdings: PortfolioHolding[]): SectorSummary[] {
  const groups = new Map<string, PortfolioHolding[]>();
  for (const holding of holdings) {
    const current = groups.get(holding.sector) ?? [];
    current.push(holding);
    groups.set(holding.sector, current);
  }
  return [...groups.entries()].map(([sector, items]) => {
    const totalInvestment = roundCurrency(items.reduce((sum, h) => sum + h.investment, 0));
    const presentValues = items.map((h) => h.presentValue).filter((v): v is number => v !== null);
    const totalPresentValue = presentValues.length === items.length
      ? roundCurrency(presentValues.reduce((sum, v) => sum + v, 0))
      : null;
    const gainLoss = totalPresentValue === null ? null : roundCurrency(totalPresentValue - totalInvestment);
    return {
      sector,
      totalInvestment,
      totalPresentValue,
      gainLoss,
      returnPercentage: gainLoss === null || totalInvestment === 0 ? null : gainLoss / totalInvestment,
      holdingsCount: items.length,
    };
  });
}

export function buildPortfolioHoldings(holdings: Holding[], marketData: Map<string, { cmp: number | null; peRatio: number | null; latestEarnings: number | null; source: 'yahoo-finance' | 'workbook-fallback'; error?: string }>): PortfolioHolding[] {
  const totalInvestment = holdings.reduce((sum, h) => sum + calculateInvestment(h.purchasePrice, h.quantity), 0);
  return holdings.map((holding) => {
    const investment = calculateInvestment(holding.purchasePrice, holding.quantity);
    const quote = holding.marketSymbol ? marketData.get(holding.marketSymbol) : undefined;
    const cmp = quote?.cmp ?? holding.sourceCmp;
    const peRatio = quote?.peRatio ?? holding.sourcePeRatio;
    const latestEarnings = quote?.latestEarnings ?? holding.sourceLatestEarnings;
    const presentValue = calculatePresentValue(cmp, holding.quantity);
    const gainLoss = calculateGainLoss(presentValue, investment);
    return {
      ...holding,
      investment,
      portfolioPercentage: calculatePortfolioWeight(investment, totalInvestment),
      presentValue,
      gainLoss,
      gainLossPercentage: calculateGainLossPercentage(gainLoss, investment),
      peRatio,
      latestEarnings,
      marketDataStatus: quote?.source === 'yahoo-finance' ? 'live' : cmp !== null ? 'fallback' : 'unavailable',
      marketDataError: quote?.error,
    };
  });
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
