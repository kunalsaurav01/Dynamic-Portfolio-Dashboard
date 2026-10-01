import { z } from 'zod';

export const holdingSchema = z.object({
  id: z.string().min(1),
  stockName: z.string().min(1),
  purchasePrice: z.number().finite().nonnegative(),
  quantity: z.number().finite().positive(),
  exchangeCode: z.string().min(1),
  marketSymbol: z.string().min(1).optional(),
  sourceCmp: z.number().finite().positive().nullable(),
  sourcePeRatio: z.number().finite().nullable(),
  sourceLatestEarnings: z.number().finite().nullable(),
  sector: z.string().min(1),
});

export const holdingsSchema = z.array(holdingSchema).min(1);

export const marketSymbolsSchema = z.object({
  symbols: z.array(z.string().min(1).max(32)).min(1).max(100),
});
