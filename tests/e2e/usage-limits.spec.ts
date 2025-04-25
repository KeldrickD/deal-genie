import { test, expect } from '@playwright/test';

test.describe('Usage Limits', () => {
  test('Free user should see usage limits in dashboard', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Log in as a free tier user
    await page.fill('input[name="email"]', 'free-user@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")');
    
    // Navigate to settings page where we can see usage
    await page.click('a[href="/settings"]');
    
    // Check that the usage limits section exists
    await expect(page.locator('h2:has-text("Usage Limits")')).toBeVisible();
    
    // Verify that limits are displayed for free tier
    await expect(page.locator('text=Deal Analysis')).toBeVisible();
    await expect(page.locator('text=/\\d+ \\/ 5/')).toBeVisible(); // Match "X / 5" pattern
  });

  test('User should see upgrade prompt when approaching limit', async ({ page }) => {
    // Go to login page and log in as a user with almost-reached limits
    await page.goto('/login');
    await page.fill('input[name="email"]', 'near-limit-user@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")');
    
    // Navigate to deals page
    await page.click('a[href="/deals"]');
    
    // Click on "Analyze Deal" button
    await page.click('button:has-text("Analyze Deal")');
    
    // Check that the warning modal appears
    await expect(page.locator('text=Usage Limit Almost Reached')).toBeVisible();
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
    
    // Close the modal
    await page.click('button:has-text("Maybe Later")');
  });

  test('User should be blocked when limit is reached', async ({ page }) => {
    // Go to login page and log in as a user who has reached their limits
    await page.goto('/login');
    await page.fill('input[name="email"]', 'limit-reached-user@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")');
    
    // Navigate to deals page
    await page.click('a[href="/deals"]');
    
    // Try to analyze a deal
    await page.click('button:has-text("Analyze Deal")');
    
    // Check that the limit reached modal appears
    await expect(page.locator('text=Usage Limit Reached')).toBeVisible();
    await expect(page.locator('text=You\'ve used all 5 free')).toBeVisible();
    
    // Verify that the Upgrade button is visible
    await expect(page.locator('button:has-text("Upgrade to Pro")')).toBeVisible();
  });
  
  test('Pro user should not see usage limits', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Log in as a pro tier user
    await page.fill('input[name="email"]', 'pro-user@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")');
    
    // Navigate to settings page
    await page.click('a[href="/settings"]');
    
    // Check usage limits section
    await expect(page.locator('h2:has-text("Usage Limits")')).toBeVisible();
    
    // Pro users should see "Unlimited" or "∞" for their limits
    await expect(page.locator('text=/∞/')).toBeVisible();
  });
}); 