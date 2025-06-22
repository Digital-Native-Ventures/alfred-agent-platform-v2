import { test, expect } from '@playwright/test';

test.describe('Alfred Agent Platform UI', () => {
  test('smoke test: home → ⌘K → plan 8', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    
    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify quick actions are visible
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Test command palette - press Cmd+K (or Ctrl+K on Linux)
    await page.keyboard.press('Meta+k');
    
    // Verify command palette opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();
    
    // Search for Plan 8
    await page.locator('input[placeholder*="command"]').fill('Phase 8');
    
    // Click on "View Phase 8 Plan" option
    await page.locator('text=View Phase 8 Plan').click();
    
    // Verify we navigated to plan page
    await expect(page.url()).toContain('/plan/8');
    
    // Verify plan content loaded
    await expect(page.locator('text=Phase 8 Documentation')).toBeVisible();
    await expect(page.locator('text=SlackBot Manager')).toBeVisible();
    
    // Test service health status
    await page.goto('/');
    
    // Verify service health indicators are present
    await expect(page.locator('[data-testid="service-health"]')).toBeVisible();
  });

  test('navigation sidebar works', async ({ page }) => {
    await page.goto('/');
    
    // Test sidebar navigation
    await page.locator('text=Phase 8 Plan').click();
    await expect(page.url()).toContain('/plan/8');
    
    // Navigate back to dashboard
    await page.locator('text=Dashboard').first().click();
    await expect(page.url()).toBe('http://localhost:8082/');
  });

  test('quick actions dashboard functionality', async ({ page }) => {
    await page.goto('/');
    
    // Verify quick actions card exists
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Test "View Phase 8" quick action
    await page.locator('text=View Phase 8').click();
    await expect(page.url()).toContain('/plan/8');
    
    // Go back and test "Architect Chat" quick action
    await page.goto('/');
    await page.locator('text=Architect Chat').click();
    await expect(page.url()).toContain('/chat');
  });

  test('command palette shortcuts work', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard shortcut
    await page.keyboard.press('Meta+k');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test ESC to close
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Test Ctrl+K as alternative
    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});