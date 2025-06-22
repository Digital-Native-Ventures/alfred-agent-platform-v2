import { test, expect } from '@playwright/test';

test('sidebar nav flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: /Projects/i }).click();
  await expect(page.locator('h1')).toHaveText(/Projects/i);
  await page.getByRole('link', { name: /Chat/i }).click();
  await expect(page.locator('h1')).toHaveText(/Chat/i);
});
