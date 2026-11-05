import { test, expect } from '@playwright/test';

test('Startseite lädt mit richtigem Titel', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Delluxe-Dellen/);
});

test('Hauptüberschrift ist sichtbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
