import { test, expect, type Page } from '@playwright/test';

// Prüft, ob der Server jede Adresse als Bild ausliefert.
// Gibt eine Liste der Probleme zurück (leer = alles in Ordnung).
async function nichtLadbar(page: Page, urls: string[]) {
    const fehler: string[] = [];
    for (const url of new Set(urls)) {
        const antwort = await page.request.get(url);
        const typ = antwort.headers()['content-type'] ?? '';
        if (!antwort.ok()) fehler.push(`${url} (Status ${antwort.status()})`);
        else if (!typ.startsWith('image/')) fehler.push(`${url} ist kein Bild (Typ „${typ}“)`);
    }
    return fehler;
}

test('alle <img>-Bilder können geladen werden', async ({ page }) => {
    await page.goto('/');

    const srcs = await page.locator('img').evaluateAll(bilder => bilder.map(b => b.getAttribute('src') ?? ''));
    expect(srcs.length, 'Keine <img>-Bilder auf der Seite gefunden').toBeGreaterThan(0);
    expect(srcs.filter(s => s.trim() === '').length, 'Es gibt <img> ohne src').toBe(0);

    // Bilder, die erst per JavaScript eingesetzt werden (z. B. FAQ: data-img)
    const nachgeladen = await page.locator('[data-img]').evaluateAll(el => el.map(e => e.getAttribute('data-img') ?? ''));

    expect(await nichtLadbar(page, [...srcs, ...nachgeladen]), 'Diese Bilder können nicht geladen werden').toEqual([]);
});

// Alt-Texte prüft tests/seo.spec.ts

test('alle CSS-Hintergrundbilder können geladen werden', async ({ page }) => {
    // Im Quelltext suchen statt auf der Seite: so werden auch Bilder gefunden,
    // die nur in bestimmten Zuständen erscheinen (aktiver Slide, Hover, Handy-Layout …)
    const quelltext = await (await page.request.get('/')).text();
    const urls = [...quelltext.matchAll(/url\(\s*['"]?([^'")]+?)['"]?\s*\)/g)]
        .map(t => t[1].trim())
        .filter(u => !u.startsWith('data:') && !u.startsWith('#'));  // eingebettete Daten, SVG-Verweise
    expect(urls.length, 'Keine Hintergrundbilder (url(…)) im Quelltext gefunden').toBeGreaterThan(0);

    expect(await nichtLadbar(page, urls), 'Diese Hintergrundbilder können nicht geladen werden').toEqual([]);
});

test('Favicon kann geladen werden', async ({ page }) => {
    await page.goto('/');

    const icons = await page.locator('link[rel~="icon"]').evaluateAll(l => l.map(e => e.getAttribute('href') ?? ''));
    expect(icons.length, 'Kein Favicon eingebunden (<link rel="icon">)').toBeGreaterThan(0);

    expect(await nichtLadbar(page, icons), 'Favicon kann nicht geladen werden').toEqual([]);
});

// ─── loading="lazy" (Projektregel aus CLAUDE.md) ────────────────

const bildschirme = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Handy',   width: 390,  height: 844 },
];

for (const b of bildschirme) {
    test.describe(`Bilder bei ${b.width} px (${b.name})`, () => {
        test.use({ viewport: { width: b.width, height: b.height } });

        test('unterhalb des Heroes mit loading="lazy", darüber ohne', async ({ page }) => {
            await page.goto('/');

            const fehler = await page.evaluate(() => {
                const hero = document.querySelector('.hero');
                if (!hero) return ['Hero-Bereich nicht gefunden (Klasse .hero)'];
                const heroUnten = hero.getBoundingClientRect().bottom + window.scrollY;

                const meldungen: string[] = [];
                for (const img of Array.from(document.querySelectorAll('img'))) {
                    // in diesem Layout ausgeblendete Bilder überspringen (z. B. Handy-Navigation auf dem Desktop)
                    if (!img.checkVisibility()) continue;

                    const oben = Math.round(img.getBoundingClientRect().top + window.scrollY);
                    const lazy = img.getAttribute('loading') === 'lazy';
                    const src = img.getAttribute('src');

                    if (oben >= heroUnten && !lazy)
                        meldungen.push(`${src} (bei ${oben} px): liegt unterhalb des Heroes, aber ohne loading="lazy"`);
                    if (oben < heroUnten && lazy)
                        meldungen.push(`${src} (bei ${oben} px): liegt im oder über dem Hero, hat aber loading="lazy" – lädt dadurch verzögert`);
                }
                return [...new Set(meldungen)];
            });

            expect(fehler, 'loading="lazy" falsch gesetzt').toEqual([]);
        });
    });
}
