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

// Laden der Bilder und Alt-Texte prüft tests/bilder.spec.ts für die ganze Seite

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
