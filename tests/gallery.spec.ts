import { test, expect, type Page } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import {
    type Slider, openWithPausedClock, readIntervalFromSource,
    checkArrows, checkEndlessLoop, checkAutoplay,
} from './helpers/slider';

// ─── Helper functions for the gallery only ──────────────────────

// Image URL of the currently active image
async function getActiveImageUrl(page: Page) {
    const activeImage = page.locator('.slider__slide.is-active .slider__image');
    await expect(activeImage, 'Nicht genau ein aktives Bild').toHaveCount(1);
    return (await activeImage.getAttribute('src')) ?? '';
}

// All image URLs of the gallery, each only once
// (the script creates copies of the slides, so remove duplicates)
async function getImageUrls(page: Page) {
    const imageUrls = await page.locator('.slider__image')
        .evaluateAll(images => images.map(image => image.getAttribute('src') ?? ''));
    return [...new Set(imageUrls.filter(imageUrl => imageUrl !== ''))];
}

// Position the progress bar shows: filled to 2/4 with 4 images means position 2
async function getProgressPosition(page: Page, imageCount: number) {
    // width the script has set (e.g. '50%'), not the width in the middle of the animation
    const width = await page.locator('#sliderProgressFill').evaluate(fill => (fill as HTMLElement).style.width);
    expect(width, 'Fortschrittsbalken hat keine Breite in Prozent').toMatch(/^[\d.]+%$/);
    return parseFloat(width) / 100 * imageCount;
}

// ─── Test data ──────────────────────────────────────────────────

// Describes the gallery slider for the shared checks in helpers/slider.ts
const gallerySlider: Slider = {
    name: 'Galerie',
    next: 'Nächstes Bild',
    prev: 'Vorheriges Bild',
    getActiveId: getActiveImageUrl,
    getIndicatorPosition: getProgressPosition,
};

// ─── Tests ──────────────────────────────────────────────────────

// tests/images.spec.ts checks image loading for the whole page, tests/seo.spec.ts the alt texts

test('Galerie: Pfeile vor/zurück wechseln das Bild', expectedResult(
    '„Weiter“ zeigt ein anderes Bild, „zurück“ wieder das vorherige'
), async ({ page }) => {
    await openWithPausedClock(page);
    await checkArrows(page, gallerySlider);
});

test('Galerie: Endlos-Schleife in beide Richtungen', expectedResult(
    'Jedes Bild erscheint genau einmal, danach wieder das erste; „zurück“ vom ersten Bild zeigt das letzte; der Fortschrittsbalken ist dabei immer passend zur Position des Bildes gefüllt'
), async ({ page }) => {
    await openWithPausedClock(page);
    const imageCount = (await getImageUrls(page)).length;
    await checkEndlessLoop(page, gallerySlider, imageCount);
});

test('Galerie: Bildwechsel automatisch im eingestellten Takt', expectedResult(
    'Bild bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch'
), async ({ page }) => {
    const interval = await readIntervalFromSource(page, /const\s+GALLERY_TAKT_MS\s*=\s*(\d+)/, 'const GALLERY_TAKT_MS = <ms>');
    await openWithPausedClock(page);
    await checkAutoplay(page, gallerySlider, interval);
});
