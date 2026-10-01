import holdingsSource from '@/data/portfolio/holdings.json';
import { holdingsSchema } from '@/app/lib/validation/schemas';
import type { Holding } from '@/app/types';

let validated: Holding[] | null = null;

export function getPortfolioHoldings(): Holding[] {
  if (!validated) {
    const result = holdingsSchema.safeParse(holdingsSource.holdings);
    if (!result.success) throw new Error(`Portfolio data validation failed: ${result.error.message}`);
    const ids = new Set<string>();
    const duplicates = result.data.filter((h) => ids.has(h.id) || ids.add(h.id) === undefined);
    if (duplicates.length) throw new Error('Portfolio data contains duplicate holding IDs');
    validated = result.data;
  }
  return validated;
}
