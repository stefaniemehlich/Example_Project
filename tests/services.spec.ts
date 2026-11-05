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

        // Test, ob ein echtes Bild dargestellt wird
        // Vortest: Bild-Element mit url(...) vorhanden? (wartet max. 5 s, klare Fehlermeldung)
        const bg = panel.locator('.services__bg');
        await expect(bg, 'Kein Hintergrundbild hinterlegt').toHaveAttribute('style', /url\(/);

        // Bild-Adresse aus dem style lesen …
        const style = await bg.getAttribute('style');

        // Bild-URL aus dem style lesen …
        const bildUrl = style?.match(/url\(['"]?([^'")]+)/)?.[1];
        expect(bildUrl, 'keine Bild-URL gefunden').toBeTruthy();

        // … und prüfen, ob Server die Datei wirklich liefert
        const antwort = await page.request.get(bildUrl!);
        expect(antwort.ok(), `Bild „${bildUrl}“ kann nicht geladen werden (Status ${antwort.status()})`).toBe(true);

    }
});
