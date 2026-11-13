import { test, expect, type Page } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { normalizeWhitespace } from './helpers/normalizeWhitespace';
import {
    type Slider, openWithPausedClock, readIntervalFromSource,
    checkArrows, checkEndlessLoop, checkAutoplay,
} from './helpers/slider';

const MIN_TEXT_LENGTH = 50;

// ─── Helper functions for the reviews only ──────────────────────

// Name in the currently active review
async function getActiveName(page: Page) {
    const nameElement = page.locator('.reviews__slide.is-active .reviews__name');
    await expect(nameElement, 'Nicht genau eine aktive Bewertung').toHaveCount(1);
    return ((await nameElement.textContent()) ?? '').trim();
}

// All names, each only once (the script creates copies of the slides)
async function getAllNames(page: Page) {
    const names = await page.locator('.reviews__name').allTextContents();
    return [...new Set(names.map(name => name.trim()))];
}

// Position of the active dot above the reviews: 1 = first dot
async function getActiveDotPosition(page: Page, reviewCount: number) {
    const dotStates = await page.locator('#reviewsDots .dot')
        .evaluateAll(dots => dots.map(dot => dot.classList.contains('active')));
    expect(dotStates, 'Anzahl der Punkte passt nicht zur Anzahl der Bewertungen').toHaveLength(reviewCount);
    expect(dotStates.filter(isActive => isActive), 'Nicht genau ein aktiver Punkt').toHaveLength(1);
    return dotStates.indexOf(true) + 1;
}

// ─── Test data ──────────────────────────────────────────────────

// Describes the reviews slider for the shared checks in helpers/slider.ts
const reviewsSlider: Slider = {
    name: 'Bewertungen',
    next: 'Nächste Bewertung',
    prev: 'Vorherige Bewertung',
    getActiveId: getActiveName,
    getIndicatorPosition: getActiveDotPosition,
};

// Text shown next to the stars, depending on how long ago the review was written
const timeTexts = [
    { monthsLater: 0, text: 'diesen Monat' },
    { monthsLater: 1, text: 'vor 1 Monat' },
    { monthsLater: 11, text: 'vor 11 Monaten' },
    { monthsLater: 12, text: 'vor 1 Jahr' },
    { monthsLater: 24, text: 'vor 2 Jahren' },
];

// ─── Content ────────────────────────────────────────────────────

test.describe('Bewertungen: Inhalt', () => {
    // without JavaScript the DOM only contains what is in the HTML file – so no slide copies
    test.use({ javaScriptEnabled: false });

    test(`jede Bewertung hat Name, 1–5 Sterne, Text ab ${MIN_TEXT_LENGTH} Zeichen und gültiges Datum`, expectedResult(
        `Jede Bewertung hat einen Namen, 1–5 Sterne, einen Text ab ${MIN_TEXT_LENGTH} Zeichen und ein Datum im Format JJJJ-MM, das nicht in der Zukunft liegt`
    ), async ({ page }) => {
        await page.goto('/');

        const cards = page.locator('.reviews__slide');
        const cardCount = await cards.count();
        expect(cardCount, 'Keine Bewertungen gefunden (Klasse .reviews__slide)').toBeGreaterThan(0);

        // current month as YYYY-MM, to compare with the review date
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);

            const name = ((await card.locator('.reviews__name').textContent()) ?? '').trim();
            const label = name || `Bewertung Nr. ${i + 1}`;
            // expect.soft: the test keeps running, all failures are reported together at the end
            expect.soft(name, `Bewertung Nr. ${i + 1} hat keinen Namen`).not.toBe('');

            // Stars: only ★, at least 1, at most 5
            const stars = ((await card.locator('.reviews__stars').textContent()) ?? '').trim();
            expect.soft(stars, `${label}: Sterne müssen 1–5 × ★ sein, gefunden: „${stars}“`).toMatch(/^★{1,5}$/);

            // Text: long enough
            const text = normalizeWhitespace(await card.locator('.reviews__quote').textContent());
            expect.soft(text.length, `${label}: Text zu kurz (${text.length} Zeichen, mind. ${MIN_TEXT_LENGTH})`)
                .toBeGreaterThanOrEqual(MIN_TEXT_LENGTH);

            // Date: format YYYY-MM and not in the future
            const date = (await card.locator('.reviews__source').getAttribute('data-review-date')) ?? '';
            expect.soft(date, `${label}: Datum muss im Format JJJJ-MM sein, gefunden: „${date}“`)
                .toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
            // comparing the texts is enough: YYYY-MM sorts alphabetically in the same order as by date
            expect.soft(date <= currentMonth, `${label}: Datum ${date} liegt in der Zukunft`).toBe(true);
        }
    });

    // The slider tests recognize the active review by its name, so the names must also be unique for them
    test('kein Name kommt doppelt vor', expectedResult(
        'Jeder Name steht nur einmal auf der Seite'
    ), async ({ page }) => {
        await page.goto('/');

        const names = (await page.locator('.reviews__name').allTextContents()).map(name => name.trim());
        const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
        expect(duplicates, 'Diese Bewertungen stehen mehrfach auf der Seite').toEqual([]);
    });
});

// ─── Time text ──────────────────────────────────────────────────

// The script turns the review date (data-review-date) into a text like "vor 3 Monaten".
// The browser clock is set to a fixed day, a given number of months after the first review.
for (const timeText of timeTexts) {
    test(`Bewertungen: Zeitangabe ${timeText.monthsLater} Monat(e) nach der Bewertung`, expectedResult(
        `Neben den Sternen steht „${timeText.text}“`
    ), async ({ page }) => {
        await page.goto('/');

        // date of the first review, e.g. '2025-11'
        const reviewDate = (await page.locator('[data-review-date]').first().getAttribute('data-review-date')) ?? '';
        expect(reviewDate, 'Datum der ersten Bewertung nicht im Format JJJJ-MM').toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        const [year, month] = reviewDate.split('-').map(Number);

        // the 15th of the month, monthsLater months after the review (Date counts months from 0)
        await page.clock.setFixedTime(new Date(year, month - 1 + timeText.monthsLater, 15));
        await page.reload();

        // every review with this date shows the same text, including the slide copies
        const timeElement = page.locator(`.reviews__source[data-review-date="${reviewDate}"]`).first();
        await expect(timeElement, `Falsche Zeitangabe für das Datum ${reviewDate}`).toHaveText(timeText.text);
    });
}

// ─── Slider ─────────────────────────────────────────────────────

test('Bewertungen: Pfeile vor/zurück wechseln die Bewertung', expectedResult(
    '„Weiter“ zeigt eine andere Bewertung, „zurück“ wieder die vorherige'
), async ({ page }) => {
    await openWithPausedClock(page);
    await checkArrows(page, reviewsSlider);
});

test('Bewertungen: Endlos-Schleife in beide Richtungen', expectedResult(
    'Jede Bewertung erscheint genau einmal, danach wieder die erste; „zurück“ von der ersten Bewertung zeigt die letzte; dabei ist immer genau der Punkt an der Position der Bewertung aktiv'
), async ({ page }) => {
    await openWithPausedClock(page);
    const cardCount = (await getAllNames(page)).length;
    await checkEndlessLoop(page, reviewsSlider, cardCount);
});

test('Bewertungen: Wechsel automatisch im eingestellten Takt', expectedResult(
    'Bewertung bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch'
), async ({ page }) => {
    const interval = await readIntervalFromSource(page, /const\s+REVIEWS_TAKT_MS\s*=\s*(\d+)/, 'const REVIEWS_TAKT_MS = <ms>');
    await openWithPausedClock(page);
    await checkAutoplay(page, reviewsSlider, interval);
});

// ─── Nothing cut off ────────────────────────────────────────────

// cards are 600 px high up to 820 px (smartphone layout) and 300 px high from 821 px (desktop) –
// checked at the narrowest width of each layout
//
// more widths need to be added if the font size ever scales with the viewport (e.g. clamp)
const viewports = [
    { name: 'Smartphone klein',     width: 320,  height: 640 },
    { name: 'erste Desktop-Breite', width: 821,  height: 900 },
];

for (const viewport of viewports) {
    test.describe(`Bewertungen bei ${viewport.width} px (${viewport.name})`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        test('kein Inhalt einer Karte wird abgeschnitten', expectedResult(
            'Name, Sterne und Text jeder Bewertung liegen vollständig innerhalb der Karte'
        ), async ({ page }) => {
            await page.goto('/');
            // only measure once the real font has loaded (font-display: swap)
            await page.evaluate(() => document.fonts.ready);

            const errors = await page.locator('.reviews__slide').evaluateAll(cards => {
                const messages: string[] = [];
                for (const card of cards) {
                    const cardRect = card.getBoundingClientRect();
                    const name = card.querySelector('.reviews__name')?.textContent?.trim() || '(ohne Name)';

                    // every element of the card (name, stars, text) must lie completely inside
                    // (1 px is allowed for rounding)
                    for (const part of Array.from(card.children)) {
                        const partRect = part.getBoundingClientRect();
                        const overflowTop    = Math.round(cardRect.top - partRect.top);
                        const overflowBottom = Math.round(partRect.bottom - cardRect.bottom);
                        if (overflowTop > 1)    messages.push(`${name}: „${part.className}“ oben ${overflowTop} px abgeschnitten`);
                        if (overflowBottom > 1) messages.push(`${name}: „${part.className}“ unten ${overflowBottom} px abgeschnitten`);
                    }
                }
                // slide copies produce the same messages – remove duplicates
                return [...new Set(messages)];
            });

            expect(errors, 'Inhalt von Bewertungskarten wird abgeschnitten').toEqual([]);
        });
    });
}
