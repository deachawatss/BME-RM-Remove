import { test, expect } from '@playwright/test';

test.describe('Main Page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/main');
    await expect(page).toHaveURL('/login');
  });
});
