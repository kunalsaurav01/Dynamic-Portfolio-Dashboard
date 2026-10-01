import { describe, expect, it } from 'vitest';
import { getPortfolioHoldings } from '@/app/lib/services/portfolio-service';

describe('portfolio source', () => {
  it('loads all workbook holdings', () => {
    const holdings = getPortfolioHoldings();
    expect(holdings).toHaveLength(29);
    expect(new Set(holdings.map((h) => h.sector)).size).toBe(6);
    expect(holdings.find((h) => h.stockName === 'HDFC Bank')?.purchasePrice).toBe(1490);
  });
});
