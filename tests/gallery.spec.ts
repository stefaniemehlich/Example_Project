import { test, expect, type Page } from '@playwright/test';
import {
    type Slider, oeffneMitAngehaltenerUhr, taktAusQuelltext,
    pruefePfeile, pruefeEndlosSchleife, pruefeAutoplay,
} from './helpers/slider';

// ─── Hilfsfunktionen nur für die Galerie ────────────────────────

// Bild-Adresse des gerade aktiven Bildes
async function aktiveSrc(page: Page) {
    const aktivesBild = page.locator('.slider__slide.is-active .slider__image');
    await expect(aktivesBild, 'Nicht genau ein aktives Bild').toHaveCount(1);
    return (await aktivesBild.getAttribute('src')) ?? '';
}

// Alle Bild-Adressen der Galerie, jede nur einmal
// (das Script legt Kopien der Slides an, daher doppelte entfernen)
async function bildUrls(page: Page) {
    const srcs = await page.locator('.slider__image')
        .evaluateAll(bilder => bilder.map(b => b.getAttribute('src') ?? ''));
    return [...new Set(srcs.filter(s => s !== ''))];
}

const galerie: Slider = {
    name: 'Galerie',
    weiter: '#sliderNext',
    zurueck: '#sliderPrev',
    aktiv: aktiveSrc,
};

// ─── Tests ──────────────────────────────────────────────────────

test('Galerie: alle Bilder können geladen werden', async ({ page }) => {
    await page.goto('/');

    const urls = await bildUrls(page);
    expect(urls.length, 'Keine Galerie-Bilder gefunden (Klasse .slider__image)').toBeGreaterThan(0);

    for (const url of urls) {
        // Server liefert die Datei? (umgeht loading="lazy", kein Scrollen nötig)
        const antwort = await page.request.get(url);
        expect(antwort.ok(), `Bild „${url}“ kann nicht geladen werden (Status ${antwort.status()})`).toBe(true);

        // für SEO: jedes Bild hat einen alt-Text
        // const bild = page.locator(`.slider__image[src="${url}"]`).first();
        // await expect(bild, `Bild „${url}“ hat keinen alt-Text`).toHaveAttribute('alt', /\S/);
    }
});

test('Galerie: Pfeile vor/zurück wechseln das Bild', async ({ page }) => {
    await oeffneMitAngehaltenerUhr(page);
    await pruefePfeile(page, galerie);
});

test('Galerie: Endlos-Schleife in beide Richtungen', async ({ page }) => {
    await oeffneMitAngehaltenerUhr(page);
    const anzahl = (await bildUrls(page)).length;
    await pruefeEndlosSchleife(page, galerie, anzahl);
});

test('Galerie: Bildwechsel automatisch im eingestellten Takt', async ({ page }) => {
    // (nur die Galerie – der Bewertungs-Slider nutzt "rNext" und passt nicht)
    const takt = await taktAusQuelltext(page, /setInterval\(\s*next\s*,\s*(\d+)\s*\)/, 'setInterval(next, <ms>)');
    await oeffneMitAngehaltenerUhr(page);
    await pruefeAutoplay(page, galerie, takt);
});
