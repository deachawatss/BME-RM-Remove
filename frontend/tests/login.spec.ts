import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/ldap login/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /username/i }).fill('invaliduser');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });
});
