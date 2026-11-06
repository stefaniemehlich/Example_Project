import { test, expect } from '@playwright/test';

test('Bereich Leistungen: Klick auf die verschiedenen Leistungen zeigen unterschiedliche Inhalte', async ({ page }) => {
    await page.goto('/');

    const tabs = page.locator('.services__tab');
    const anzahl = await tabs.count();
    expect(anzahl, 'Keine Service-Tabs vorhanden (Klasse .services__tab)').toBeGreaterThan(0);

    for (let i = 0; i < anzahl; i++) {
        const tab = tabs.nth(i);
        await tab.click();

        // Panel zum Tab suchen
        const panelId = await tab.getAttribute('data-tab');
        const panel = page.locator(`#${panelId}`);

        // Tab ist aktiv
        await expect(tab, 'Tab ist nach Klick nicht aktiv').toHaveClass(/is-active/);
        // zugehöriges Panel ist sichtbar…
        await expect(panel, `Panel #${panelId} wird nicht angezeigt`).toBeVisible();
        // …nur dieses eine und keine anderen
        await expect(page.locator('.services__panel:visible'), 'Mehr als ein Panel sichtbar').toHaveCount(1);

        // Text vorhanden (genauer Inhalt wird nicht geprüft)
        await expect(panel.locator('p'), 'Text im Panel fehlt').not.toBeEmpty();

        // Hintergrundbild hinterlegt?
        // (ob die Datei geladen werden kann, prüft tests/bilder.spec.ts für die ganze Seite)
        const bg = panel.locator('.services__bg');
        await expect(bg, 'Kein Hintergrundbild hinterlegt').toHaveAttribute('style', /url\(/);
    }
});
