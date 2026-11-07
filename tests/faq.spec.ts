import { test, expect } from '@playwright/test';

const MIN_ANTWORTLAENGE = 50;

// Leerraum (Zeilenumbrüche, Einrückungen) zu einem Leerzeichen zusammenfassen
function bereinigt(text: string | null) {
    return (text ?? '').replace(/\s+/g, ' ').trim();
}

// ─── Verhalten ──────────────────────────────────────────────────

// Desktop (ab 821 px): Liste links, Bild rechts – immer genau eine Frage offen
// Handy (bis 820 px):  Akkordeon ohne Bild – beim Laden alle zu, erneuter Klick klappt zu
const ansichten = [
    { name: 'Desktop', width: 1280, height: 800, offenBeimLaden: 1, erneuterKlickSchliesst: false },
    { name: 'Handy',   width: 390,  height: 844, offenBeimLaden: 0, erneuterKlickSchliesst: true },
];

for (const a of ansichten) {
    test.describe(`FAQ (${a.name})`, () => {
        test.use({ viewport: { width: a.width, height: a.height } });

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

                // … und wird nach dem Klick eingesetzt (das Script tauscht es nach 300 ms;
                // auf dem Handy ist das Bild ausgeblendet, wird aber trotzdem gewechselt)
                await eintrag.locator('.faq__question').click();
                await expect.soft(page.locator('#faqImg'), `${wer}: nach dem Klick wird nicht das passende Bild eingesetzt`)
                    .toHaveAttribute('src', bildUrl);
            }
        });

        test(`beim Laden ${a.offenBeimLaden} Frage offen, nach jedem Klick genau die angeklickte`, async ({ page }) => {
            await page.goto('/');

            const eintraege = page.locator('.faq__item');
            const aktive = page.locator('.faq__item.is-active');
            await expect(aktive, `Beim Laden sind nicht genau ${a.offenBeimLaden} Fragen offen`).toHaveCount(a.offenBeimLaden);

            const anzahl = await eintraege.count();
            for (let i = 0; i < anzahl; i++) {
                await eintraege.nth(i).locator('.faq__question').click();
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
                await eintraege.nth(i).locator('.faq__question').click();
                await nurOffen(i, `Nach Klick auf FAQ Nr. ${i + 1}`);
            }
        });

        test(`erneuter Klick auf die offene Frage ${a.erneuterKlickSchliesst ? 'klappt sie zu' : 'lässt sie offen'}`, async ({ page }) => {
            await page.goto('/');

            const eintraege = page.locator('.faq__item');
            expect(await eintraege.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // zweite Frage öffnen und dann noch einmal anklicken
            const eintrag = eintraege.nth(1);
            await eintrag.locator('.faq__question').click();
            await eintrag.locator('.faq__question').click();

            if (a.erneuterKlickSchliesst) {
                await expect(eintrag, 'Frage ist nach erneutem Klick noch offen').not.toHaveClass(/is-active/);
                await expect(eintrag.locator('.faq__answer'), 'Antwort ist nach erneutem Klick noch sichtbar').toBeHidden();
                await expect(page.locator('.faq__item.is-active'), 'Es ist noch eine Frage offen').toHaveCount(0);
            } else {
                await expect(eintrag, 'Frage ist nach erneutem Klick nicht mehr offen').toHaveClass(/is-active/);
                await expect(eintrag.locator('.faq__answer'), 'Antwort ist nach erneutem Klick nicht mehr sichtbar').toBeVisible();
                await expect(page.locator('.faq__item.is-active'), 'Nicht genau eine Frage offen').toHaveCount(1);
            }
        });

        test('Fragen lassen sich per Tastatur öffnen', async ({ page }) => {
            await page.goto('/');

            const eintraege = page.locator('.faq__item');
            expect(await eintraege.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // zweite Frage mit der Tastatur ansteuern und mit Enter öffnen
            const frage = eintraege.nth(1).locator('.faq__question');
            await frage.focus();
            await expect(frage, 'Frage lässt sich nicht mit der Tastatur ansteuern').toBeFocused();
            await page.keyboard.press('Enter');

            await expect(eintraege.nth(1), 'Frage ist nach Enter nicht aktiv').toHaveClass(/is-active/);
            // Screenreader erfahren über aria-expanded, welche Frage offen ist
            await expect(frage, 'aria-expanded der geöffneten Frage ist nicht "true"').toHaveAttribute('aria-expanded', 'true');
            await expect(eintraege.nth(0).locator('.faq__question'), 'aria-expanded der geschlossenen Frage ist nicht "false"')
                .toHaveAttribute('aria-expanded', 'false');
        });
    });
}

test('FAQ: jedes Bild wird nur bei einer Frage verwendet', async ({ page }) => {
    await page.goto('/');

    const bilder = await page.locator('.faq__item').evaluateAll(el => el.map(e => e.getAttribute('data-img') ?? ''));
    const doppelt = [...new Set(bilder.filter((b, i) => bilder.indexOf(b) !== i))];
    expect(doppelt, 'Diese Bilder werden bei mehreren Fragen verwendet').toEqual([]);
});

// ─── Antworten werden nicht abgeschnitten ───────────────────────

// offene Antworten sind höchstens 300 px (Handy) bzw. 200 px (Desktop) hoch –
// geprüft wird jeweils an den engsten Stellen
const breiten = [320, 390, 820, 821, 1280, 1920];

for (const breite of breiten) {
    test.describe(`FAQ bei ${breite} px`, () => {
        test.use({ viewport: { width: breite, height: 900 } });

        test('keine Antwort wird abgeschnitten', async ({ page }) => {
            await page.goto('/');

            const eintraege = page.locator('.faq__item');
            const anzahl = await eintraege.count();

            for (let i = 0; i < anzahl; i++) {
                const eintrag = eintraege.nth(i);
                const frage = bereinigt(await eintrag.locator('.faq__question').textContent());
                const antwort = eintrag.locator('.faq__answer');

                await eintrag.locator('.faq__question').click();
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

// Gleichheit von SEO-Schema und FAQ prüft tests/seo.spec.ts
