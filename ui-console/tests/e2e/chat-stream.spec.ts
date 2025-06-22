import { test, expect } from '@playwright/test';

test.describe('Architect Chat Streaming', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the architect chat page
    await page.goto('/architect');
  });

  test('should display chat interface', async ({ page }) => {
    // Check for key UI elements
    await expect(page.locator('h1')).toContainText('Architect Assistant');
    await expect(page.locator('input[placeholder*="architecture"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    // Check for empty state message
    await expect(page.locator('text=Start a conversation')).toBeVisible();
    await expect(page.locator('text=Ask about system design')).toBeVisible();
  });

  test('should enable send button when text is entered', async ({ page }) => {
    const input = page.locator('input[placeholder*="architecture"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Initially disabled
    await expect(sendButton).toBeDisabled();
    
    // Type message
    await input.fill('Hello');
    
    // Should be enabled
    await expect(sendButton).toBeEnabled();
  });

  test('should send message and show loading state', async ({ page }) => {
    const input = page.locator('input[placeholder*="architecture"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Type and send message
    await input.fill('Test message');
    await sendButton.click();
    
    // Should clear input
    await expect(input).toHaveValue('');
    
    // Should show user message
    await expect(page.locator('text=Test message')).toBeVisible();
    
    // Should show loading indicator
    await expect(page.locator('.animate-spin')).toBeVisible();
  });
});