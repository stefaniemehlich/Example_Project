import { test, expect } from '@playwright/test';

//Facebook
test('Navbar-SocialIcon-Facebook öffnet in neuem Tab', async ({ page, context }) => {
  // Anfragen an Facebook abfangen und eine Ersatzseite zurückgeben
  await context.route(/facebook\.com/, route =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Facebook (Test)</h1>' })
  );

  await page.goto('/');

  // Link im Social-Bereich der Navbar suchen
  const link = page.locator('.navbar__social').getByRole('link', { name: 'Facebook' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', 'https://facebook.com');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);

  // Klicken und auf neuen Tab warten
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;

  // neuer Tab mit Facebook-URL
  await expect(popup).toHaveURL(/facebook\.com/);
});

//Instagram
test('Navbar-SocialIcon-Instagram öffnet in neuem Tab', async ({ page, context }) => {
  // Anfragen an Instagram abfangen und eine Ersatzseite zurückgeben
  await context.route(/instagram\.com/, route =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Instagram (Test)</h1>' })
  );

  await page.goto('/');

  // Link im Social-Bereich der Navbar suchen
  const link = page.locator('.navbar__social').getByRole('link', { name: 'Instagram' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', 'https://instagram.com');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);

  // Klicken und auf neuen Tab warten
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;

  // neuer Tab mit Instagram-URL
  await expect(popup).toHaveURL(/instagram\.com/);
});

//TikTok
test('Navbar-SocialIcon-TikTok öffnet in neuem Tab', async ({ page, context }) => {
  // Anfragen an TikTok abfangen und eine Ersatzseite zurückgeben
  await context.route(/tiktok\.com/, route =>
    route.fulfill({ contentType: 'text/html', body: '<h1>TikTok (Test)</h1>' })
  );

  await page.goto('/');

  // Link im Social-Bereich der Navbar suchen
  const link = page.locator('.navbar__social').getByRole('link', { name: 'TikTok' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', 'https://tiktok.com');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);

  // Klicken und auf neuen Tab warten
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;

  // neuer Tab mit TikTok-URL
  await expect(popup).toHaveURL(/tiktok\.com/);
});

