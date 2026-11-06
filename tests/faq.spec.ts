import { test, expect, type Page } from '@playwright/test';

const MIN_ANTWORTLAENGE = 50;

// Leerraum (Zeilenumbrüche, Einrückungen) zu einem Leerzeichen zusammenfassen
function bereinigt(text: string | null) {
    return (text ?? '').replace(/\s+/g, ' ').trim();
}

// ─── FAQ Desktop ────────────────────────────────────────────────

test.describe('FAQ Desktop', () => {
    // die Desktop-FAQ wird erst ab 821 px angezeigt
    test.use({ viewport: { width: 1280, height: 800 } });

    test(`zu jeder Frage gibt es eine Antwort ab ${MIN_ANTWORTLAENGE} Zeichen und ein Bild`, async ({ page }) => {
        await page.goto('/');

        const eintraege = page.locator('.faq__item');
        const anzahl = await eintraege.count();
        expect(anzahl, 'Keine FAQ-Einträge gefunden (Klasse .faq__item)').toBeGreaterThan(0);

        for (let i = 0; i < anzahl; i++) {
            const eintrag = eintraege.nth(i);

            const frage = bereinigt(await eintrag.locator('.faq__question').textContent());
            const wer = frage ? `„${frage}“` : `FAQ Nr. ${i + 1}`;
            // expect.soft: Test läuft weiter, am Ende werden alle Fehler gemeinsam gemeldet
            expect.soft(frage, `FAQ Nr. ${i + 1} hat keine Frage`).not.toBe('');

            const antwort = bereinigt(await eintrag.locator('.faq__answer').textContent());
            expect.soft(antwort.length, `${wer}: Antwort zu kurz (${antwort.length} Zeichen, mind. ${MIN_ANTWORTLAENGE})`)
                .toBeGreaterThanOrEqual(MIN_ANTWORTLAENGE);

            // Bild hinterlegt …
            const bildUrl = (await eintrag.getAttribute('data-img')) ?? '';
            expect.soft(bildUrl, `${wer}: kein Bild hinterlegt (data-img)`).not.toBe('');

            // … und wird nach dem Klick auch angezeigt (das Script tauscht es nach 300 ms)
            await eintrag.click();
            await expect.soft(page.locator('#faqImg'), `${wer}: nach dem Klick wird nicht das passende Bild angezeigt`)
                .toHaveAttribute('src', bildUrl);
        }
    });

    test('jedes Bild wird nur bei einer Frage verwendet', async ({ page }) => {
        await page.goto('/');

        const bilder = await page.locator('.faq__item').evaluateAll(el => el.map(e => e.getAttribute('data-img') ?? ''));
        const doppelt = [...new Set(bilder.filter((b, i) => bilder.indexOf(b) !== i))];
        expect(doppelt, 'Diese Bilder werden bei mehreren Fragen verwendet').toEqual([]);
    });

    test('es ist immer genau eine Frage aktiv', async ({ page }) => {
        await page.goto('/');

        const eintraege = page.locator('.faq__item');
        const aktive = page.locator('.faq__item.is-active');
        await expect(aktive, 'Beim Laden ist nicht genau eine Frage aktiv').toHaveCount(1);

        const anzahl = await eintraege.count();
        for (let i = 0; i < anzahl; i++) {
            await eintraege.nth(i).click();
            await expect(eintraege.nth(i), `FAQ Nr. ${i + 1} ist nach dem Klick nicht aktiv`).toHaveClass(/is-active/);
            await expect(aktive, `Nach Klick auf FAQ Nr. ${i + 1} ist nicht genau eine Frage aktiv`).toHaveCount(1);
        }
    });

    test('Antworten sind nur bei der aktiven Frage sichtbar', async ({ page }) => {
        await page.goto('/');

        const eintraege = page.locator('.faq__item');
        const anzahl = await eintraege.count();

        // prüft alle Antworten: nur die von Nr. „offen“ ist sichtbar
        async function nurOffen(offen: number, wann: string) {
            for (let j = 0; j < anzahl; j++) {
                const antwort = eintraege.nth(j).locator('.faq__answer');
                if (j === offen) await expect(antwort, `${wann}: Antwort Nr. ${j + 1} ist nicht sichtbar`).toBeVisible();
                else             await expect(antwort, `${wann}: Antwort Nr. ${j + 1} ist sichtbar, obwohl nicht aktiv`).toBeHidden();
            }
        }

        // beim Laden: die Antwort der aktiven Frage
        const startIndex = await eintraege.evaluateAll(el => el.findIndex(e => e.classList.contains('is-active')));
        await nurOffen(startIndex, 'Beim Laden');

        for (let i = 0; i < anzahl; i++) {
            await eintraege.nth(i).click();
            await nurOffen(i, `Nach Klick auf FAQ Nr. ${i + 1}`);
        }
    });

    test('erneuter Klick auf die aktive Frage lässt sie offen', async ({ page }) => {
        await page.goto('/');

        const eintraege = page.locator('.faq__item');
        expect(await eintraege.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

        // zweite Frage öffnen und dann noch einmal anklicken
        const eintrag = eintraege.nth(1);
        await eintrag.click();
        await eintrag.click();

        await expect(eintrag, 'Frage ist nach erneutem Klick nicht mehr aktiv').toHaveClass(/is-active/);
        await expect(eintrag.locator('.faq__answer'), 'Antwort ist nach erneutem Klick nicht mehr sichtbar').toBeVisible();
        await expect(page.locator('.faq__item.is-active'), 'Nicht genau eine Frage aktiv').toHaveCount(1);
    });
});

// ─── Antworten werden nicht abgeschnitten ───────────────────────

// offene Antworten sind höchstens 200 px hoch – je schmaler die Spalte, desto enger
const desktopBreiten = [821, 1280, 1920];

for (const breite of desktopBreiten) {
    test.describe(`FAQ Desktop bei ${breite} px`, () => {
        test.use({ viewport: { width: breite, height: 900 } });

        test('keine Antwort wird abgeschnitten', async ({ page }) => {
            await page.goto('/');

            const eintraege = page.locator('.faq__item');
            const anzahl = await eintraege.count();

            for (let i = 0; i < anzahl; i++) {
                const eintrag = eintraege.nth(i);
                const frage = bereinigt(await eintrag.locator('.faq__question').textContent());
                const antwort = eintrag.locator('.faq__answer');

                await eintrag.click();
                // so lange messen, bis die Aufklapp-Animation fertig ist:
                // was nicht in die Box passt, ist abgeschnitten
                await expect.soft
                    .poll(() => antwort.evaluate(el => el.scrollHeight - el.clientHeight),
                        { message: `Antwort zu „${frage}“ wird abgeschnitten (zu lang für die maximale Höhe)` })
                    .toBeLessThanOrEqual(1);
            }
        });
    });
}

// Gleichheit von SEO-Schema, Mobil- und Desktop-FAQ prüft tests/seo.spec.ts
