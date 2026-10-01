import { test, expect } from '@playwright/test';

test('dashboard loads portfolio and core sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Portfolio Dashboard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Holdings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sector breakdown' })).toBeVisible();
  await expect(page.getByText('HDFC Bank')).toBeVisible();
});
