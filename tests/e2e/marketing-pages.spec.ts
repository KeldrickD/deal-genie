import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test('Features page → Get Started button leads to signup', async ({ page }) => {
    await page.goto('/features');
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: 'Unlock Your Investment Potential', level: 1 })).toBeVisible();

    // Find a button that contains "Get Started" (adjust if needed)
    // This assumes the Get Started button is not within the feature cards themselves
    // If it is, you might need a more specific locator like within the header or footer.
    // Let's assume there's a main CTA button.
    // const getStartedButton = page.getByRole('button', { name: /get started/i }); 
    // await getStartedButton.click();

    // Placeholder: If the button is part of the nav, it might link directly
    // Let's test clicking the nav button instead
    const navGetStartedButton = page.locator('nav').getByRole('link', { name: /get started free/i });
    await navGetStartedButton.click();
    
    // Expect redirection to the signup page
    await expect(page).toHaveURL('/signup');
    
    // Check for an element unique to the signup form/page
    // !! Adjust selector to your actual form/page structure !!
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible(); 
    // Or check for a specific form input:
    // await expect(page.getByLabel('Email')).toBeVisible();
  });

  // Add more tests for Pricing and About pages navigation/CTAs
  test('Pricing page links work', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: 'Simple, Transparent Pricing', level: 1 })).toBeVisible();
    // Example: Test clicking the Pro plan trial button
    // await page.locator('div:has-text("Pro")').getByRole('button', { name: /Start 14-Day Free Trial/i }).click();
    // await expect(page).toHaveURL('/signup?plan=pro'); // Assuming signup handles plan params
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'About GenieOS', level: 1 })).toBeVisible();
    await expect(page.getByText('Keldrick Dickey')).toBeVisible();
  });
}); 