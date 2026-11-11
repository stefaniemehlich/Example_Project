import { test, expect, type Locator } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { normalizeWhitespace } from './helpers/normalizeWhitespace';

const MIN_ANSWER_LENGTH = 50;

// The button with the question text inside an FAQ entry
const questionButton = (item: Locator) => item.getByRole('button');

// ─── Behavior ───────────────────────────────────────────────────

// Desktop (from 821 px): list on the left, image on the right – always exactly one question open
// Smartphone (up to 820 px): accordion without image – all closed on load, a second click collapses
const viewports = [
    { name: 'Desktop', width: 1280, height: 800, openOnLoad: 1, secondClickCloses: false },
    { name: 'Smartphone', width: 390, height: 844, openOnLoad: 0, secondClickCloses: true },
];

for (const viewport of viewports) {
    test.describe(`FAQ (${viewport.name})`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        test(`zu jeder Frage gibt es eine Antwort mit mind. ${MIN_ANSWER_LENGTH} Zeichen und ein Bild`, expectedResult(
            `Jeder FAQ-Eintrag hat eine Frage, eine Antwort mit mind. ${MIN_ANSWER_LENGTH} Zeichen und ein Bild; nach dem Klick wird das passende Bild eingesetzt`
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const itemCount = await items.count();
            expect(itemCount, 'Keine FAQ-Einträge gefunden (Klasse .faq__item)').toBeGreaterThan(0);

            for (let i = 0; i < itemCount; i++) {
                const item = items.nth(i);

                const question = normalizeWhitespace(await questionButton(item).textContent());
                const label = question ? `„${question}“` : `FAQ Nr. ${i + 1}`;
                // expect.soft: the test keeps running, all failures are reported together at the end
                expect.soft(question, `FAQ Nr. ${i + 1} hat keine Frage`).not.toBe('');

                const answer = normalizeWhitespace(await item.locator('.faq__answer').textContent());
                expect.soft(answer.length, `${label}: Antwort zu kurz (${answer.length} Zeichen, mind. ${MIN_ANSWER_LENGTH})`)
                    .toBeGreaterThanOrEqual(MIN_ANSWER_LENGTH);

                // image is set …
                const imageUrl = (await item.getAttribute('data-img')) ?? '';
                expect.soft(imageUrl, `${label}: kein Bild hinterlegt (data-img)`).not.toBe('');

                // … and is inserted after the click (the script swaps it after 300 ms;
                // on smartphones the image is hidden but still swapped)
                await questionButton(item).click();
                await expect.soft(page.locator('#faqImg'), `${label}: nach dem Klick wird nicht das passende Bild eingesetzt`)
                    .toHaveAttribute('src', imageUrl);
            }
        });

        test(`beim Laden ${viewport.openOnLoad} Frage(n) offen, nach jedem Klick nur genau die Angeklickte`, expectedResult(
            `Beim Laden ist ${viewport.openOnLoad === 1 ? 'genau eine' : 'keine'} Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv`
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const activeItems = page.locator('.faq__item.is-active');
            await expect(activeItems, `Beim Laden sind nicht genau ${viewport.openOnLoad} Frage(n) offen`).toHaveCount(viewport.openOnLoad);

            const itemCount = await items.count();
            for (let i = 0; i < itemCount; i++) {
                await questionButton(items.nth(i)).click();
                await expect(items.nth(i), `FAQ Nr. ${i + 1} ist nach dem Klick nicht aktiv`).toHaveClass(/is-active/);
                await expect(activeItems, `Nach Klick auf FAQ Nr. ${i + 1} ist nicht genau eine Frage aktiv`).toHaveCount(1);
            }
        });

        test('Antworten sind nur bei der aktiven Frage sichtbar', expectedResult(
            'Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const itemCount = await items.count();

            // checks all answers: only the one at index "openIndex" is visible, all others are hidden
            async function expectOnlyAnswerVisible(openIndex: number, when: string) {
                for (let j = 0; j < itemCount; j++) {
                    const answer = items.nth(j).locator('.faq__answer');
                    if (j === openIndex) await expect(answer, `${when}: Antwort Nr. ${j + 1} ist nicht sichtbar`).toBeVisible();
                    else                 await expect(answer, `${when}: Antwort Nr. ${j + 1} ist sichtbar, obwohl nicht aktiv`).toBeHidden();
                }
            }

            // on load: the answer of the active question
            // (-1 if no question is open, as on smartphones: then all answers must be hidden)
            const startIndex = await items.evaluateAll(elements => elements.findIndex(element => element.classList.contains('is-active')));
            await expectOnlyAnswerVisible(startIndex, 'Beim Laden');

            for (let i = 0; i < itemCount; i++) {
                await questionButton(items.nth(i)).click();
                await expectOnlyAnswerVisible(i, `Nach Klick auf FAQ Nr. ${i + 1}`);
            }
        });

        test(`erneuter Klick auf die offene Frage ${viewport.secondClickCloses ? 'klappt sie zu' : 'lässt sie offen'}`, expectedResult(
            viewport.secondClickCloses
                ? 'Frage klappt zu, Antwort ist ausgeblendet, keine Frage ist mehr offen'
                : 'Frage bleibt offen, Antwort bleibt sichtbar, genau eine Frage ist offen'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            expect(await items.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // open the second question and then click it again
            const item = items.nth(1);
            await questionButton(item).click();
            await questionButton(item).click();

            if (viewport.secondClickCloses) {
                await expect(item, 'Frage ist nach erneutem Klick noch offen').not.toHaveClass(/is-active/);
                await expect(item.locator('.faq__answer'), 'Antwort ist nach erneutem Klick noch sichtbar').toBeHidden();
                await expect(page.locator('.faq__item.is-active'), 'Es ist noch eine Frage offen').toHaveCount(0);
            } else {
                await expect(item, 'Frage ist nach erneutem Klick nicht mehr offen').toHaveClass(/is-active/);
                await expect(item.locator('.faq__answer'), 'Antwort ist nach erneutem Klick nicht mehr sichtbar').toBeVisible();
                await expect(page.locator('.faq__item.is-active'), 'Nicht genau eine Frage offen').toHaveCount(1);
            }
        });

        test('Fragen lassen sich per Tastatur öffnen', expectedResult(
            'Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false"'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            expect(await items.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // set the focus on the second question and open it with Enter
            const question = questionButton(items.nth(1));
            await question.focus();
            await expect(question, 'Frage lässt sich nicht fokussieren').toBeFocused();
            await page.keyboard.press('Enter');

            await expect(items.nth(1), 'Frage ist nach Enter nicht aktiv').toHaveClass(/is-active/);
            // screen readers learn from aria-expanded which question is open
            await expect(question, 'aria-expanded der geöffneten Frage ist nicht "true"').toHaveAttribute('aria-expanded', 'true');
            await expect(questionButton(items.nth(0)), 'aria-expanded der geschlossenen Frage ist nicht "false"')
                .toHaveAttribute('aria-expanded', 'false');
        });
    });
}

// ─── Content ────────────────────────────────────────────────────

test('FAQ: jedes Bild wird nur bei einer Frage verwendet', expectedResult(
    'Kein Bild (data-img) ist bei mehr als einer Frage hinterlegt'
), async ({ page }) => {
    await page.goto('/');

    const imageUrls = await page.locator('.faq__item').evaluateAll(faqItems => faqItems.map(item => item.getAttribute('data-img') ?? ''));
    const duplicates = [...new Set(imageUrls.filter((imageUrl, i) => imageUrls.indexOf(imageUrl) !== i))];
    expect(duplicates, 'Diese Bilder werden bei mehreren Fragen verwendet').toEqual([]);
});

// ─── Answers are not cut off ────────────────────────────────────

// open answers are at most 300 px (smartphone) or 200 px (desktop) high –
// checked at the narrowest width of each layout
//
// more widths need to be added if the font size ever scales with the viewport (e.g. clamp)
const widths = [320, 821];

for (const width of widths) {
    test.describe(`FAQ bei ${width} px`, () => {
        test.use({ viewport: { width, height: 900 } });

        test('keine Antwort wird abgeschnitten', expectedResult(
            'Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const itemCount = await items.count();

            for (let i = 0; i < itemCount; i++) {
                const item = items.nth(i);
                const question = normalizeWhitespace(await questionButton(item).textContent());
                const answer = item.locator('.faq__answer');

                await questionButton(item).click();
                // keep measuring until the expand animation is done:
                // whatever does not fit into the box is cut off (1 px is allowed for rounding)
                await expect.soft
                    .poll(() => answer.evaluate(element => element.scrollHeight - element.clientHeight),
                        { message: `Antwort zu „${question}“ wird abgeschnitten (zu lang für die maximale Höhe)` })
                    .toBeLessThanOrEqual(1);
            }
        });
    });
}

// tests/seo.spec.ts checks that the SEO schema and the FAQ match
