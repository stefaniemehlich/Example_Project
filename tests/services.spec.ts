import { test, expect } from '@playwright/test';

test('Bereich Leistungen: Klick auf die verschiedenen Leistungen zeigen unterschiedliche Inhalte', async ({ page }) => {
  await page.goto('/');

  const tabs = page.locator('.services__tab');
  const anzahl = await tabs.count();
  expect(anzahl).toBeGreaterThan(0);

  for (let i = 0; i < anzahl; i++) {
    const tab = tabs.nth(i);
    await tab.click();

    // Panel zum Tab suchen
    const panelId = await tab.getAttribute('data-tab');
    const panel = page.locator(`#${panelId}`);

    // Tab ist aktiv
    await expect(tab).toHaveClass(/is-active/);
    // zugehöriges Panel ist sichtbar…
    await expect(panel).toBeVisible();
    // …nur dieses eine und keine anderen
    await expect(page.locator('.services__panel:visible')).toHaveCount(1);

    // Text vorhanden (genauer Inhalt wird nicht geprüft)
    await expect(panel.locator('p')).not.toBeEmpty();
    
    //Test ob ein echtes Bild dargestellt wird
    // Bild-Adresse aus dem style lesen …
    const style = await panel.locator('.services__bg').getAttribute('style');
    const bildUrl = style?.match(/url\(['"]?([^'")]+)/)?.[1];
    expect(bildUrl).toBeTruthy();

    // … und prüfen, ob der Server die Datei wirklich liefert
    const antwort = await page.request.get(bildUrl!);
    expect(antwort.ok()).toBe(true);

  }
});
