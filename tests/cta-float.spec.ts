import { test, expect, type Page, type Locator } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { checkExternalLink } from './helpers/checkExternalLink';
import { scrollToY, scrollToSection, scrollToBottom } from './helpers/scroll';

// Floating CTA buttons at the bottom right (desktop) or bottom center (mobile):
// "WhatsApp" and "Schaden checken"

// Target of the WhatsApp button
const WHATSAPP_URL = 'https://wa.me/4917612345678';

// ─── Helper functions ───────────────────────────────────────────

// After scrolling, the buttons briefly slide into position (animation).
// Only measure once they are in the same place for two measurements in a row.
// Generous timeout: with many parallel tests, Firefox in particular can take over 1 second per measurement.
// intervals: measure again right away – by default Playwright waits longer and longer between measurements (up to 1 second).
async function waitForFinalPosition(element: Locator) {
    let previousPosition = '';
    await expect.poll(async () => {
        // eslint-disable-next-line playwright/no-wait-for-timeout -- bewusste kurze Pause, siehe Kommentar oben
        await element.page().waitForTimeout(100);
        const currentPosition = JSON.stringify(await element.boundingBox());
        const positionUnchanged = currentPosition === previousPosition;
        previousPosition = currentPosition;
        return positionUnchanged;
    }, { timeout: 10_000, intervals: [100] }).toBe(true);
    return (await element.boundingBox())!;
}

// Distance from the bottom edge of the button to the bottom edge of the viewport
async function distanceToViewportBottom(page: Page, element: Locator) {
    const box = await waitForFinalPosition(element);
    return page.viewportSize()!.height - (box.y + box.height);
}

// ─── Tests ──────────────────────────────────────────────────────

const viewports = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Smartphone', width: 390, height: 844 },
];

for (const viewport of viewports) {
    test.describe(`CTA-Buttons (${viewport.name})`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        let whatsappButton: Locator;
        let damageCheckButton: Locator;

        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            const ctaFloat = page.locator('.cta-float');
            whatsappButton = ctaFloat.getByRole('link', { name: 'WhatsApp' });
            damageCheckButton = ctaFloat.getByRole('button', { name: 'Schaden checken' });
        });

        // 1) Visible and clickable – at the top, at every section and at the very bottom
        test('Buttons sichtbar & klickbar', expectedResult(
            'Beide Buttons vollständig im Bild und nicht verdeckt – am Seitenanfang, in jeder Section und am Seitenende'
        ), async ({ page }) => {
            // Many positions × 2 buttons, each waiting for the animation: triple the time limit for this test
            test.slow();

            // Read all sections from the HTML
            const sectionNames = await page.locator('section').evaluateAll(
                sectionElements => sectionElements.map(element => element.id || element.className),   // name for the report
            );
            // at least 1 section must exist
            expect(sectionNames.length, 'Keine Section im HTML gefunden').toBeGreaterThan(0);

            const positions = [
                { name: 'Seitenanfang', scroll: () => scrollToY(page, 0) },
                ...sectionNames.map((name, i) => ({ name, scroll: () => scrollToSection(page, i) })),
                { name: 'Seitenende', scroll: () => scrollToBottom(page) },
            ];

            for (const position of positions) {
                await test.step(position.name, async () => {
                    await position.scroll();
                    for (const button of [whatsappButton, damageCheckButton]) {
                        await waitForFinalPosition(button);
                        // completely inside the visible area
                        await expect(button).toBeInViewport({ ratio: 1 });
                        // not covered by other elements (the click is only simulated)
                        await button.click({ trial: true });
                    }
                });
            }
        });

        // 2a) Fixed position as long as the footer is not in view
        test('Buttons bleiben beim Scrollen am selben Platz', expectedResult(
            'Abstand zum unteren Bildrand ist gleich, solange der Footer nicht sichtbar ist'
        ), async ({ page }) => {
            await scrollToSection(page, 1);
            const distanceNearTop = await distanceToViewportBottom(page, damageCheckButton);
            // Section 4 must be far enough up that the footer is not in view yet –
            // update the number if the sections in index.html change
            await scrollToSection(page, 4);
            const distanceFurtherDown = await distanceToViewportBottom(page, damageCheckButton);

            // same distance at both positions – the 0 means "0 decimal places":
            // browsers measure in fractions of a pixel, so a difference below 0.5 px still counts as equal
            expect(distanceFurtherDown).toBeCloseTo(distanceNearTop, 0);
        });

        // 2b) At the end of the page the buttons move up and do not cover the footer
        test('Buttons verdecken am Seitenende den Footer nicht', expectedResult(
            'Buttons rutschen nach oben und liegen vollständig oberhalb des Footers'
        ), async ({ page }) => {
            await scrollToSection(page, 1);
            const defaultDistance = await distanceToViewportBottom(page, damageCheckButton);

            await scrollToBottom(page);
            const footerTop = (await page.getByRole('contentinfo').boundingBox())!.y;

            for (const button of [whatsappButton, damageCheckButton]) {
                const box = await waitForFinalPosition(button);
                expect(box.y + box.height).toBeLessThanOrEqual(footerTop);
            }
            // and they have actually moved up to do so
            expect(await distanceToViewportBottom(page, damageCheckButton)).toBeGreaterThan(defaultDistance);
        });

        // 3) WhatsApp link
        test('WhatsApp-Button öffnet WhatsApp in neuem Tab', expectedResult(
            `Neuer Tab öffnet ${WHATSAPP_URL} (Link mit target="_blank" und rel="noopener")`
        ), async ({ page }) => {
            await checkExternalLink(page.locator('.cta-float'), { name: 'WhatsApp', url: WHATSAPP_URL });
        });

        // 4) Overlay: open, close and scroll lock
        test.describe('Schaden-checken-Overlay', () => {
            // Note: the overlay is always in the HTML and only transparent (opacity 0).
            // Playwright still counts it as "visible" – so check the class is-open.
            const overlay = (page: Page) => page.getByRole('dialog', { name: 'Schaden einreichen' });
            // the X at the top right of the overlay
            const closeButton = (page: Page) => overlay(page).getByRole('button', { name: 'Schließen' });
            const expectOverlayOpen = async (page: Page) => {
                await expect(overlay(page)).toHaveClass(/is-open/);
                await expect(overlay(page)).toHaveCSS('opacity', '1');
                await expect(overlay(page).getByRole('heading', { name: 'Schaden checken' })).toBeInViewport();
            };
            const expectOverlayClosed = async (page: Page) => {
                await expect(overlay(page)).not.toHaveClass(/is-open/);
                await expect(overlay(page)).toHaveCSS('opacity', '0');
            };

            test('Button öffnet das Overlay', expectedResult(
                'Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar'
            ), async ({ page }) => {
                await expectOverlayClosed(page);
                await damageCheckButton.click();
                await expectOverlayOpen(page);
            });

            test('Overlay schließt mit dem X', expectedResult(
                'Overlay ist geschlossen'
            ), async ({ page }) => {
                await damageCheckButton.click();
                await expectOverlayOpen(page);
                await closeButton(page).click();
                await expectOverlayClosed(page);
            });

            test('Overlay schließt mit der Escape-Taste', expectedResult(
                'Overlay ist geschlossen'
            ), async ({ page }) => {
                await damageCheckButton.click();
                await expectOverlayOpen(page);
                await page.keyboard.press('Escape');
                await expectOverlayClosed(page);
            });

            test('Overlay schließt bei Klick außerhalb des Formulars', expectedResult(
                'Overlay ist geschlossen'
            ), async ({ page }) => {
                await damageCheckButton.click();
                await expectOverlayOpen(page);
                // top left corner of the overlay: the dark area around the form
                await overlay(page).click({ position: { x: 5, y: 5 } });
                await expectOverlayClosed(page);
            });

            test('Klick in das Formular lässt das Overlay offen', expectedResult(
                'Overlay bleibt geöffnet'
            ), async ({ page }) => {
                await damageCheckButton.click();
                await expectOverlayOpen(page);
                await overlay(page).getByRole('heading', { name: 'Schaden checken' }).click();
                await expectOverlayOpen(page);
            });

            test('Seite ist bei offenem Overlay nicht scrollbar', expectedResult(
                'Scrollen der Seite ist gesperrt, solange das Overlay offen ist; Scrollen erst nach dem Schließen wieder möglich'
            ), async ({ page }) => {
                const body = page.locator('body');
                await expect(body, 'Seite ist schon vor dem Öffnen gesperrt').not.toHaveCSS('overflow', 'hidden');

                await damageCheckButton.click();
                await expectOverlayOpen(page);
                await expect(body, 'Seite ist bei offenem Overlay nicht gesperrt').toHaveCSS('overflow', 'hidden');

                await closeButton(page).click();
                await expectOverlayClosed(page);
                await expect(body, 'Seite bleibt nach dem Schließen gesperrt').not.toHaveCSS('overflow', 'hidden');
            });
        });
    });
}
