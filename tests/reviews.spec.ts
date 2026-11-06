import { test, expect, type Page } from '@playwright/test';
import {
    type Slider, oeffneMitAngehaltenerUhr, taktAusQuelltext,
    pruefePfeile, pruefeEndlosSchleife, pruefeAutoplay,
} from './helpers/slider';

const MIN_TEXTLAENGE = 50;

// ─── Hilfsfunktionen nur für die Bewertungen ────────────────────

// Name in der gerade aktiven Bewertung
async function aktiverName(page: Page) {
    const name = page.locator('.reviews__slide.is-active .reviews__name');
    await expect(name, 'Nicht genau eine aktive Bewertung').toHaveCount(1);
    return ((await name.textContent()) ?? '').trim();
}

// Alle Namen, jeder nur einmal (das Script legt Kopien der Slides an)
async function alleNamen(page: Page) {
    const namen = await page.locator('.reviews__name').allTextContents();
    return [...new Set(namen.map(n => n.trim()))];
}

const bewertungen: Slider = {
    name: 'Bewertungen',
    weiter: '#reviewsNext',
    zurueck: '#reviewsPrev',
    aktiv: aktiverName,
};

// ─── Inhalt ─────────────────────────────────────────────────────

test.describe('Bewertungen: Inhalt', () => {
    // ohne JavaScript steht nur im DOM, was in der HTML-Datei steht – also keine Slide-Kopien
    test.use({ javaScriptEnabled: false });

    test(`jede Bewertung hat Name, 1–5 Sterne, Text ab ${MIN_TEXTLAENGE} Zeichen und gültiges Datum`, async ({ page }) => {
        await page.goto('/');

        const karten = page.locator('.reviews__slide');
        const anzahl = await karten.count();
        expect(anzahl, 'Keine Bewertungen gefunden (Klasse .reviews__slide)').toBeGreaterThan(0);

        // aktueller Monat als JJJJ-MM, zum Vergleich mit dem Bewertungsdatum
        const jetzt = new Date();
        const aktuellerMonat = `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}`;

        for (let i = 0; i < anzahl; i++) {
            const karte = karten.nth(i);

            // Name
            const name = ((await karte.locator('.reviews__name').textContent()) ?? '').trim();
            const wer = name || `Bewertung Nr. ${i + 1}`;
            // expect.soft: Test läuft weiter, am Ende werden alle Fehler gemeinsam gemeldet
            expect.soft(name, `Bewertung Nr. ${i + 1} hat keinen Namen`).not.toBe('');

            // Sterne: nur ★, mindestens 1, höchstens 5
            const sterne = ((await karte.locator('.reviews__stars').textContent()) ?? '').trim();
            expect.soft(sterne, `${wer}: Sterne müssen 1–5 × ★ sein, gefunden: „${sterne}“`).toMatch(/^★{1,5}$/);

            // Text: Zeilenumbrüche und Einrückungen zu einem Leerzeichen zusammenfassen
            const text = ((await karte.locator('.reviews__quote').textContent()) ?? '').replace(/\s+/g, ' ').trim();
            expect.soft(text.length, `${wer}: Text zu kurz (${text.length} Zeichen, mind. ${MIN_TEXTLAENGE})`)
                .toBeGreaterThanOrEqual(MIN_TEXTLAENGE);

            // Datum: Format JJJJ-MM und nicht in der Zukunft
            const datum = (await karte.locator('.reviews__source').getAttribute('data-review-date')) ?? '';
            expect.soft(datum, `${wer}: Datum muss im Format JJJJ-MM sein, gefunden: „${datum}“`)
                .toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
            expect.soft(datum <= aktuellerMonat, `${wer}: Datum ${datum} liegt in der Zukunft`).toBe(true);
        }
    });

    test('kein Name kommt doppelt vor', async ({ page }) => {
        await page.goto('/');

        const namen = (await page.locator('.reviews__name').allTextContents()).map(n => n.trim());
        const doppelt = namen.filter((n, i) => namen.indexOf(n) !== i);
        expect(doppelt, 'Diese Bewertungen stehen mehrfach auf der Seite').toEqual([]);
    });
});

// ─── Slider ─────────────────────────────────────────────────────

test('Bewertungen: Pfeile vor/zurück wechseln die Bewertung', async ({ page }) => {
    await oeffneMitAngehaltenerUhr(page);
    await pruefePfeile(page, bewertungen);
});

test('Bewertungen: Endlos-Schleife in beide Richtungen', async ({ page }) => {
    await oeffneMitAngehaltenerUhr(page);
    const anzahl = (await alleNamen(page)).length;
    await pruefeEndlosSchleife(page, bewertungen, anzahl);
});

test('Bewertungen: Wechsel automatisch im eingestellten Takt', async ({ page }) => {
    const takt = await taktAusQuelltext(page, /const\s+REVIEWS_TAKT_MS\s*=\s*(\d+)/, 'const REVIEWS_TAKT_MS = <ms>');
    await oeffneMitAngehaltenerUhr(page);
    await pruefeAutoplay(page, bewertungen, takt);
});

// ─── Nichts abgeschnitten ───────────────────────────────────────

// Bildschirmbreiten, jeweils an den Grenzen des Layouts
// (bis 820 px: Mobil-Layout mit 600 px hohen Karten, ab 821 px: Desktop mit 300 px)
const bildschirme = [
    { name: 'Handy klein',          width: 320,  height: 640 },
    { name: 'Handy',                width: 390,  height: 844 },
    { name: 'letzte Mobil-Breite',  width: 820,  height: 1180 },
    { name: 'erste Desktop-Breite', width: 821,  height: 900 },
    { name: 'Laptop',               width: 1280, height: 800 },
    { name: 'Desktop breit',        width: 1920, height: 1080 },
];

for (const b of bildschirme) {
    test.describe(`Bewertungen bei ${b.width} px (${b.name})`, () => {
        test.use({ viewport: { width: b.width, height: b.height } });

        test('kein Inhalt einer Karte wird abgeschnitten', async ({ page }) => {
            await page.goto('/');
            // erst messen, wenn die echte Schrift geladen ist (font-display: swap)
            await page.evaluate(() => document.fonts.ready);

            const fehler = await page.locator('.reviews__slide').evaluateAll(karten => {
                const meldungen: string[] = [];
                for (const karte of karten) {
                    const rahmen = karte.getBoundingClientRect();
                    const name = karte.querySelector('.reviews__name')?.textContent?.trim() || '(ohne Name)';

                    // jedes Element der Karte (Name, Sterne, Text) muss ganz drin liegen
                    for (const teil of Array.from(karte.children)) {
                        const box = teil.getBoundingClientRect();
                        const obenRaus  = Math.round(rahmen.top - box.top);
                        const untenRaus = Math.round(box.bottom - rahmen.bottom);
                        if (obenRaus > 1)  meldungen.push(`${name}: „${teil.className}“ oben ${obenRaus} px abgeschnitten`);
                        if (untenRaus > 1) meldungen.push(`${name}: „${teil.className}“ unten ${untenRaus} px abgeschnitten`);
                    }
                }
                // Kopien der Slides liefern dieselben Meldungen – doppelte entfernen
                return [...new Set(meldungen)];
            });

            expect(fehler, 'Inhalt von Bewertungskarten wird abgeschnitten').toEqual([]);
        });
    });
}
