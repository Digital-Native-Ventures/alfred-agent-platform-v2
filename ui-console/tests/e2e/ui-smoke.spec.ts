import { test, expect } from '@playwright/test';

test.describe('Stat cards & activity dots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'http://localhost:3002/');
  });

  test('stat cards show colored icons', async ({ page }) => {
    const colors = ['blue', 'green', 'purple', 'orange'];
    for (const color of colors) {
      const card = page.locator(`[data-testid="stat-card-${color}"]`);
      await expect(card).toHaveClass(new RegExp(`bg-${color}-50`));
    }
  });

  test('recent activity shows status dots', async ({ page }) => {
    await expect(page.locator('[data-testid="status-dot-completed"]')).toHaveClass(/bg-green/);
    await expect(page.locator('[data-testid="status-dot-inprogress"]')).toHaveClass(/bg-yellow/);
  });
});