import { describe, expect, it } from 'vitest';
import { GET as portfolioGET } from '@/app/api/portfolio/route';

describe('portfolio API', () => {
  it('returns normalized holdings', async () => {
    const response = await portfolioGET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.holdings).toHaveLength(29);
  });
});
