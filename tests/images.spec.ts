import { test, expect, type Page } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';

// ─── Helper functions ───────────────────────────────────────────

// Checks whether the server delivers every URL as an image.
// Returns a list of problems (empty = everything is fine).
async function findUnloadableImages(page: Page, urls: string[]) {
    const errors: string[] = [];
    for (const url of new Set(urls)) {
        // an empty address would request the page itself and produce a confusing message
        if (url.trim() === '') {
            errors.push('leere Bild-Adresse (src oder data-img fehlt)');
            continue;
        }
        const response = await page.request.get(url);
        const contentType = response.headers()['content-type'] ?? '';
        if (!response.ok()) errors.push(`${url} (Status ${response.status()})`);
        else if (!contentType.startsWith('image/')) errors.push(`${url} ist kein Bild (Typ „${contentType}“)`);
    }
    return errors;
}

// ─── Images can be loaded ───────────────────────────────────────

test('Bilder: alle <img>-Bilder können geladen werden', expectedResult(
    'Jedes <img> hat ein src; alle Bilder (auch per data-img nachgeladene) werden vom Server als Bild ausgeliefert'
), async ({ page }) => {
    await page.goto('/');

    const imageUrls = await page.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src') ?? ''));
    expect(imageUrls.length, 'Keine <img>-Bilder auf der Seite gefunden').toBeGreaterThan(0);
    expect(imageUrls.filter(imageUrl => imageUrl.trim() === ''), 'Es gibt <img> ohne src').toHaveLength(0);

    // Images that are only inserted by JavaScript (e.g. FAQ: data-img)
    const scriptInsertedUrls = await page.locator('[data-img]')
        .evaluateAll(elements => elements.map(element => element.getAttribute('data-img') ?? ''));

    expect(await findUnloadableImages(page, [...imageUrls, ...scriptInsertedUrls]), 'Diese Bilder können nicht geladen werden').toEqual([]);
});

// tests/seo.spec.ts checks the alt texts

test('Bilder: alle CSS-Hintergrundbilder können geladen werden', expectedResult(
    'Alle im Quelltext mit url(…) eingebundenen Hintergrundbilder werden vom Server als Bild ausgeliefert'
), async ({ page }) => {
    // Search the source code instead of the page: this also finds images
    // that only appear in certain states (active slide, hover, mobile layout …).
    // The pattern matches every url(…) in the source – so far these are all images.
    // If a font file is ever included with url(…), it has to be excluded here.
    const source = await (await page.request.get('/')).text();
    const urls = [...source.matchAll(/url\(\s*['"]?([^'")]+?)['"]?\s*\)/g)]
        .map(match => match[1].trim())
        .filter(url => !url.startsWith('data:') && !url.startsWith('#'));  // embedded data, SVG references
    expect(urls.length, 'Keine Hintergrundbilder (url(…)) im Quelltext gefunden').toBeGreaterThan(0);

    expect(await findUnloadableImages(page, urls), 'Diese Hintergrundbilder können nicht geladen werden').toEqual([]);
});

test('Bilder: Favicon kann geladen werden', expectedResult(
    'Favicon ist eingebunden und wird vom Server als Bild ausgeliefert'
), async ({ page }) => {
    await page.goto('/');

    const iconUrls = await page.locator('link[rel~="icon"]').evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''));
    expect(iconUrls.length, 'Kein Favicon eingebunden (<link rel="icon">)').toBeGreaterThan(0);

    expect(await findUnloadableImages(page, iconUrls), 'Favicon kann nicht geladen werden').toEqual([]);
});

// ─── loading="lazy" ───────────────

const viewports = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Smartphone', width: 390, height: 844 },
];

for (const viewport of viewports) {
    test.describe(`Bilder bei ${viewport.width} px (${viewport.name})`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        test('unterhalb des Heroes mit loading="lazy", darüber ohne', expectedResult(
            'Sichtbare Bilder unterhalb des Heroes haben loading="lazy", Bilder im oder über dem Hero nicht'
        ), async ({ page }) => {
            await page.goto('/');

            // Compares the top edge of every image with the bottom edge of the hero,
            // both measured from the top of the page (position in the window + scrolled distance)
            const errors = await page.evaluate(() => {
                const hero = document.querySelector('.hero');
                if (!hero) return ['Hero-Bereich nicht gefunden (Klasse .hero)'];
                const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;

                const messages: string[] = [];
                for (const image of Array.from(document.querySelectorAll('img'))) {
                    // skip images hidden in this layout (e.g. mobile navigation on desktop)
                    if (!image.checkVisibility()) continue;

                    const imageTop = Math.round(image.getBoundingClientRect().top + window.scrollY);
                    const isLazy = image.getAttribute('loading') === 'lazy';
                    const imageUrl = image.getAttribute('src');

                    if (imageTop >= heroBottom && !isLazy)
                        messages.push(`${imageUrl} (bei ${imageTop} px): liegt unterhalb des Heroes, aber ohne loading="lazy"`);
                    if (imageTop < heroBottom && isLazy)
                        messages.push(`${imageUrl} (bei ${imageTop} px): liegt im oder über dem Hero, hat aber loading="lazy" – lädt dadurch verzögert`);
                }
                // slide copies produce the same messages – remove duplicates
                return [...new Set(messages)];
            });

            expect(errors, 'loading="lazy" falsch gesetzt').toEqual([]);
        });
    });
}
