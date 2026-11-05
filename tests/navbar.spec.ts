import { test, expect } from '@playwright/test';

//Leistungen
test('Navbar-Leistungen korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link in der Hauptnavigation suchen
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  const link = nav.getByRole('link', { name: 'Leistungen' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#leistungen');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#leistungen$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#leistungen')).toBeInViewport();
});

//Nachhaltigkeit
test('Navbar-Nachhaltigkeit korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link in der Hauptnavigation suchen
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  const link = nav.getByRole('link', { name: 'Nachhaltigkeit' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#nachhaltigkeit');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#nachhaltigkeit$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#nachhaltigkeit')).toBeInViewport();
});

//Galerie
test('Navbar-Galerie korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link in der Hauptnavigation suchen
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  const link = nav.getByRole('link', { name: 'Galerie' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#galerie');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#galerie$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#galerie')).toBeInViewport();
});

test('Navbar-Kontakt korrekt verlinkt', async ({ page }) => {
  await page.goto('/');
  
  // Link in der Hauptnavigation suchen
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  const link = nav.getByRole('link', { name: 'Kontakt' });

  // korrekte Verlinkung im html
  await expect(link).toHaveAttribute('href', '#kontakt');
  await link.click();
  // veränderte URL nach Klick
  await expect(page).toHaveURL(/#kontakt$/);
  // im sichtbaren Teil der Seite?
  await expect(page.locator('#kontakt')).toBeInViewport();
});


