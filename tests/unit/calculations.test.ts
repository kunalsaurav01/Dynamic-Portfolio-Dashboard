import { describe, expect, it } from 'vitest';
import { buildPortfolioHoldings, calculateGainLoss, calculateGainLossPercentage, calculateInvestment, calculatePortfolioWeight, calculatePresentValue, calculateSectorSummary } from '@/app/lib/calculations';

describe('portfolio calculations', () => {
  it('calculates investment', () => expect(calculateInvestment(100, 12)).toBe(1200));
  it('calculates portfolio weight', () => expect(calculatePortfolioWeight(250, 1000)).toBe(0.25));
  it('calculates present value', () => expect(calculatePresentValue(125, 12)).toBe(1500));
  it('calculates gain/loss', () => expect(calculateGainLoss(1500, 1200)).toBe(300));
  it('calculates gain/loss percentage', () => expect(calculateGainLossPercentage(300, 1200)).toBe(0.25));
  it('handles missing CMP and zero investment safely', () => {
    expect(calculatePresentValue(null, 10)).toBeNull();
    expect(calculateGainLoss(null, 100)).toBeNull();
    expect(calculateGainLossPercentage(10, 0)).toBeNull();
    expect(calculatePortfolioWeight(10, 0)).toBe(0);
  });

  it('marks sector present value unavailable when a holding has no CMP', () => {
    const holdings = buildPortfolioHoldings([{
      id: 'holding-1',
      stockName: 'Example',
      purchasePrice: 100,
      quantity: 2,
      exchangeCode: 'NSE',
      sourceCmp: null,
      sourcePeRatio: null,
      sourceLatestEarnings: null,
      sector: 'Technology',
    }], new Map());

    expect(calculateSectorSummary(holdings)[0].totalPresentValue).toBeNull();
  });
});
