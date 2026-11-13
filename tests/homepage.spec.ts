import { test, expect } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { scrollThroughPage } from './helpers/scroll';

// ─── Loading ────────────────────────────────────────────────────

// tests/seo.spec.ts checks the main heading (h1), the meta description and the page language

test('Startseite: lädt mit richtigem Titel', expectedResult(
    'Seitentitel enthält den Firmennamen „Dellen Company“'
), async ({ page }) => {
    await page.goto('/');
    await expect(page, 'Seitentitel enthält nicht „Dellen Company“').toHaveTitle(/Dellen Company/);
});

// Needs an internet connection: the page loads Google Fonts,
// and without a connection that request is reported as failed.
test('Startseite: lädt ohne JavaScript-Fehler und ohne fehlgeschlagene Anfragen', expectedResult(
    'Beim Laden und Durchscrollen der Seite gibt es keine JavaScript-Fehler, keine Fehler in der Konsole und keine fehlgeschlagenen Anfragen'
), async ({ page }) => {
    const errors: string[] = [];
    // uncaught errors in the page's scripts
    page.on('pageerror', error => errors.push(`JavaScript-Fehler: ${error.message}`));
    // errors written to the browser console
    page.on('console', message => {
        if (message.type() === 'error') errors.push(`Konsole: ${message.text()}`);
    });
    // requests that got no answer at all (e.g. server not reachable)
    page.on('requestfailed', request => errors.push(`Anfrage fehlgeschlagen: ${request.url()} (${request.failure()?.errorText})`));
    // requests answered with an error status (e.g. 404 for a missing image)
    page.on('response', response => {
        if (response.status() >= 400) errors.push(`Status ${response.status()}: ${response.url()}`);
    });

    await page.goto('/');
    await scrollThroughPage(page);
    // wait until the lazy images have finished loading
    // eslint-disable-next-line playwright/no-networkidle -- statische Seite ohne Hintergrund-Anfragen; hier soll jede begonnene Anfrage abgewartet werden
    await page.waitForLoadState('networkidle');

    expect(errors, 'Fehler beim Laden der Seite').toEqual([]);
});

// ─── No horizontal scrolling ────────────────────────────────────

// desktop layout only (from 821 px) – smartphone widths are deliberately left out in this example project
const widths = [821, 1280, 1920];

for (const width of widths) {
    test.describe(`Startseite bei ${width} px`, () => {
        test.use({ viewport: { width, height: 900 } });

        test('kein horizontales Scrollen', expectedResult(
            'Die Seite ist nicht breiter als das Fenster'
        ), async ({ page }) => {
            await page.goto('/');
            // only measure once the real font has loaded (font-display: swap)
            await page.evaluate(() => document.fonts.ready);

            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(overflow, `Seite ist ${overflow} px breiter als das Fenster`).toBeLessThanOrEqual(0);
        });
    });
}

// ─── Reveal animation ───────────────────────────────────────────

// Areas with the class .reveal start invisible (opacity 0) and are faded in by a script
// as soon as they scroll into view. If the script fails, they stay invisible.
// Playwright counts opacity 0 as "visible", so the opacity is checked directly.

test('Startseite: letzter Einblend-Bereich ist nach dem Laden noch ausgeblendet', expectedResult(
    'Der letzte Einblend-Bereich der Seite ist nach dem Laden noch unsichtbar (opacity 0)'
), async ({ page }) => {
    await page.goto('/');

    const revealAreas = page.locator('.reveal');
    expect(await revealAreas.count(), 'Keine Einblend-Bereiche gefunden (Klasse .reveal)').toBeGreaterThan(0);

    // the last area is far below the window, so it cannot have been in view yet
    const lastArea = revealAreas.last();
    await expect(lastArea, 'Bereich ist schon eingeblendet, obwohl er noch nicht im Fenster war').not.toHaveClass(/visible/);
    await expect(lastArea, 'Bereich ist nicht ausgeblendet').toHaveCSS('opacity', '0');
});

test('Startseite: jeder Einblend-Bereich wird beim Scrollen eingeblendet', expectedResult(
    'Jeder Einblend-Bereich ist vollständig sichtbar (opacity 1), sobald er ins Fenster gescrollt wurde'
), async ({ page }) => {
    await page.goto('/');

    const revealAreas = page.locator('.reveal');
    const areaCount = await revealAreas.count();
    expect(areaCount, 'Keine Einblend-Bereiche gefunden (Klasse .reveal)').toBeGreaterThan(0);

    for (let i = 0; i < areaCount; i++) {
        const area = revealAreas.nth(i);
        // name for the report: the area's own classes, without the two classes of the animation
        const ownClasses = ((await area.getAttribute('class')) ?? '').replace(/\b(reveal|visible)\b/g, '').trim();
        const label = ownClasses ? `Einblend-Bereich Nr. ${i + 1} („${ownClasses}“)` : `Einblend-Bereich Nr. ${i + 1}`;

        await area.scrollIntoViewIfNeeded();
        // expect.soft: the test keeps running, all failures are reported together at the end
        // (toHaveCSS waits until the 0.7 s fade-in is done)
        await expect.soft(area, `${label} wird nicht eingeblendet`).toHaveCSS('opacity', '1');
    }
});
