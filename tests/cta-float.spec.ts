import { test, expect, Page, Locator } from '@playwright/test';
import { expectedResult } from './helpers/expectedResultInTestcase';

// Schwebende CTA-Buttons unten rechts (Desktop) bzw. unten mittig (mobile):
// "WhatsApp" und "Schaden checken"

// ─── Hilfsfunktionen ────────────────────────────────────────────

// an eine Stelle der Seite springen
async function scrolleZu(page: Page, y: number) {
    await page.evaluate(ziel => window.scrollTo({ top: ziel, behavior: 'instant' }), y);
}

// Zu einer Section springen (Nummer = Reihenfolge im HTML)
async function scrolleZuSection(page: Page, nummer: number) {
    const y = await page.locator('section').nth(nummer).evaluate(
        el => el.getBoundingClientRect().top + window.scrollY,
    );
    await scrolleZu(page, y);
}

async function scrolleGanzNachUnten(page: Page) {
    await scrolleZu(page, await page.evaluate(() => document.documentElement.scrollHeight));
}

// Die Buttons gleiten nach dem Scrollen kurz an ihre Position (Animation).
// Erst messen, wenn sie zwei Messungen hintereinander am selben Platz stehen.
// Großzügige Wartezeit: Bei vielen parallelen Tests braucht v. a. Firefox pro Messung teils über 1 Sekunde.
async function buttonAnEndposition(element: Locator) {
    let vorherigePosition = '';
    await expect.poll(async () => {
        await element.page().waitForTimeout(100);
        const aktuellePosition = JSON.stringify(await element.boundingBox());
        const buttonAnGleicherPosition = aktuellePosition === vorherigePosition;
        vorherigePosition = aktuellePosition;
        return buttonAnGleicherPosition;
    }, { timeout: 10_000 }).toBe(true);
    return (await element.boundingBox())!;
}

// Abstand der Button-Unterkante zum unteren Bildrand
async function abstandZumBildrand(page: Page, element: Locator) {
    const box = await buttonAnEndposition(element);
    return page.viewportSize()!.height - (box.y + box.height);
}

// ─── Tests ──────────────────────────────────────────────────────

const ansichten = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Handy', width: 390, height: 844 },
];

for (const a of ansichten) {
    test.describe(`CTA-Buttons (${a.name})`, () => {
        test.use({ viewport: { width: a.width, height: a.height } });

        let whatsapp: Locator;
        let schadenCheck: Locator;

        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            const ctaFloat = page.locator('.cta-float');
            whatsapp = ctaFloat.getByRole('link', { name: 'WhatsApp' });
            schadenCheck = ctaFloat.getByRole('button', { name: 'Schaden checken' });
        });

        // 1) Sichtbar und klickbar – oben, an jeder Sektion und ganz unten
        test('CTA Buttons an korrekter Position', expectedResult(
            'Beide Buttons vollständig im Bild und nicht verdeckt – Seitenanfang, jede Section und Seitenende'
        ), async ({ page }) => {
            // Sections aus dem HTML auslesen
            const sections = await page.locator('section').evaluateAll(
                liste => liste.map(el => el.id || el.className),   // Name für den Bericht
            );
            // mind. 1 Section muss vorhanden sein
            expect(sections.length, 'keine Section im html gefunden').toBeGreaterThan(0);

            const positionen = [
                { name: 'Seitenanfang', scrollen: () => scrolleZu(page, 0) },
                ...sections.map((name, i) => ({ name, scrollen: () => scrolleZuSection(page, i) })),
                { name: 'Seitenende', scrollen: () => scrolleGanzNachUnten(page) },
            ];

            for (const p of positionen) {
                await test.step(p.name, async () => {
                    await p.scrollen();
                    for (const button of [whatsapp, schadenCheck]) {
                        await buttonAnEndposition(button);
                        // komplett im sichtbaren Bereich
                        await expect(button).toBeInViewport({ ratio: 1 });
                        // nicht von anderen Elementen verdeckt (Klick wird nur simuliert)
                        await button.click({ trial: true });
                    }
                })
            }
        });
        // 2a) Feste Position, solange der Footer nicht im Bild ist
        test('Buttons bleiben beim Scrollen am selben Platz', expectedResult(
            'Abstand zum unteren Bildrand ist in der Seitenmitte überall gleich'
        ), async ({ page }) => {
            await scrolleZuSection(page, 1);
            const abstandOben = await abstandZumBildrand(page, schadenCheck);

            await scrolleZuSection(page, 4);
            const abstandWeiterUnten = await abstandZumBildrand(page, schadenCheck);

            expect(abstandWeiterUnten).toBeCloseTo(abstandOben, 0);
        });

        // 2b) Am Seitenende weichen die Buttons nach oben aus und verdecken den Footer nicht
        test('Buttons verdecken am Seitenende den Footer nicht', expectedResult(
            'Buttons rutschen nach oben und liegen vollständig oberhalb des Footers'
        ), async ({ page }) => {
            await scrolleZuSection(page, 1);
            const abstandNormal = await abstandZumBildrand(page, schadenCheck);

            await scrolleGanzNachUnten(page);
            const footerOben = (await page.getByRole('contentinfo').boundingBox())!.y;

            for (const button of [whatsapp, schadenCheck]) {
                const box = await buttonAnEndposition(button);
                expect(box.y + box.height).toBeLessThanOrEqual(footerOben);
            }
            // und sie sind dafür tatsächlich nach oben gewandert
            expect(await abstandZumBildrand(page, schadenCheck)).toBeGreaterThan(abstandNormal);
        });

        // 3) WhatsApp-Link
        test('WhatsApp-Button öffnet WhatsApp in neuem Tab', expectedResult(
            'Neuer Tab öffnet wa.me/4917612345678 (Link mit target="_blank" und rel="noopener")'
        ), async ({ page }) => {
            await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/4917612345678');
            await expect(whatsapp).toHaveAttribute('target', '_blank');
            await expect(whatsapp).toHaveAttribute('rel', /noopener/);

            // Die echte WhatsApp-Seite nicht laden – nur prüfen, dass der neue Tab dorthin will
            await page.context().route('https://wa.me/**', route =>
                route.fulfill({ status: 200, contentType: 'text/html', body: 'WhatsApp (Testersatz)' }),
            );
            const neuerTab = page.waitForEvent('popup');
            await whatsapp.click();
            await expect(await neuerTab).toHaveURL('https://wa.me/4917612345678');
        });

        // 4) Overlay öffnen und schließen
        test.describe('Schaden-checken-Overlay', () => {
            // Achtung: Das Overlay ist immer im HTML und nur durchsichtig (opacity 0).
            // Playwright zählt es dann trotzdem als "sichtbar" – daher die Klasse is-open prüfen.
            const istOffen = async (page: Page) => {
                const overlay = page.locator('#schadenModal');
                await expect(overlay).toHaveClass(/is-open/);
                await expect(overlay).toHaveCSS('opacity', '1');
                await expect(overlay.getByRole('heading', { name: 'Schaden checken' })).toBeInViewport();
            };
            const istZu = async (page: Page) => {
                const overlay = page.locator('#schadenModal');
                await expect(overlay).not.toHaveClass(/is-open/);
                await expect(overlay).toHaveCSS('opacity', '0');
            };

            test('Button öffnet das Overlay', expectedResult(
                'Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar'
            ), async ({ page }) => {
                await istZu(page);
                await schadenCheck.click();
                await istOffen(page);
            });

            test('Overlay schließt mit dem X', expectedResult(
                'Overlay ist geschlossen'
            ), async ({ page }) => {
                await schadenCheck.click();
                await istOffen(page);
                await page.locator('#schadenModalClose').click();
                await istZu(page);
            });

            test('Overlay schließt mit der Escape-Taste', expectedResult(
                'Overlay ist geschlossen'
            ), async ({ page }) => {
                await schadenCheck.click();
                await istOffen(page);
                await page.keyboard.press('Escape');
                await istZu(page);
            });
        });
    });
}
