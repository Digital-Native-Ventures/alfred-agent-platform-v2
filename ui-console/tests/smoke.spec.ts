import { test, expect } from '@playwright/test';

test.describe('Shell MVP Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('sidebar is collapsible', async ({ page }) => {
    // Check sidebar is visible
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Click hamburger to collapse
    await page.click('[data-sidebar="trigger"]');
    
    // Check sidebar is collapsed (has data-state="collapsed")
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    
    // Click again to expand
    await page.click('[data-sidebar="trigger"]');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });

  test('active route highlighting works', async ({ page }) => {
    // Should redirect to /overview
    await expect(page).toHaveURL('http://localhost:3000/overview');
    
    // Overview should be active
    const overviewButton = page.locator('[data-active="true"]').filter({ hasText: 'Overview' });
    await expect(overviewButton).toBeVisible();
    
    // Navigate to projects
    await page.click('text=Projects');
    await expect(page).toHaveURL('http://localhost:3000/projects');
    
    // Projects should be active
    const projectsButton = page.locator('[data-active="true"]').filter({ hasText: 'Projects' });
    await expect(projectsButton).toBeVisible();
  });

  test('service health bulbs are visible', async ({ page }) => {
    // Check for 3 green service bulbs
    const serviceBulbs = page.locator('.bg-green-500.rounded-full.w-2.h-2');
    await expect(serviceBulbs).toHaveCount(3);
  });

  test('all main routes work', async ({ page }) => {
    // Test overview
    await page.goto('http://localhost:3000/overview');
    await expect(page).toHaveURL('http://localhost:3000/overview');
    
    // Test projects
    await page.goto('http://localhost:3000/projects');
    await expect(page).toHaveURL('http://localhost:3000/projects');
    
    // Test chat
    await page.goto('http://localhost:3000/chat');
    await expect(page).toHaveURL('http://localhost:3000/chat');
    
    // Test project plan (example with ID 1)
    await page.goto('http://localhost:3000/projects/1/plan');
    await expect(page).toHaveURL('http://localhost:3000/projects/1/plan');
  });
});
