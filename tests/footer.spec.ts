import { test, expect } from '@playwright/test';

//Nachhaltigkeit
test('Footer-Nachhaltigkeit korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link im Footer suchen
  const footer = page.getByRole('contentinfo');
  const link = footer.getByRole('link', { name: 'Nachhaltigkeit' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#nachhaltigkeit');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#nachhaltigkeit$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#nachhaltigkeit')).toBeInViewport();
});

//Galerie
test('Footer-Galerie korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link im Footer suchen
  const footer = page.getByRole('contentinfo');
  const link = footer.getByRole('link', { name: 'galerie' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#galerie');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#galerie$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#galerie')).toBeInViewport();
});

//Galerie
test('Footer-Bewertungen korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link im Footer suchen
  const footer = page.getByRole('contentinfo');
  const link = footer.getByRole('link', { name: 'bewertungen' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#bewertungen');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#bewertungen$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#bewertungen')).toBeInViewport();
});

