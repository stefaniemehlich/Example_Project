import { test, expect, type Page } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { normalizeWhitespace } from './helpers/normalizeWhitespace';

// ─── Helper functions ───────────────────────────────────────────

// One service: a tab with its panel
type Service = {
    name: string;       // label of the tab
    text: string;       // text in the panel
    imageUrl: string;   // background image of the panel
};

// Read tab label, text and background image of every service from the HTML
async function readServices(page: Page): Promise<Service[]> {
    // The raw values are read in the browser and cleaned up afterwards,
    // because the helper normalizeWhitespace is not available inside the browser
    const rawServices = await page.locator('.services__tab').evaluateAll(tabs => tabs.map(tab => {
        const panel = document.getElementById(tab.getAttribute('data-tab') ?? '');
        return {
            name: tab.textContent,
            text: panel?.querySelector('.services__answer')?.textContent,
            backgroundStyle: panel?.querySelector('.services__bg')?.getAttribute('style'),
        };
    }));
    return rawServices.map(rawService => ({
        name: normalizeWhitespace(rawService.name),
        text: normalizeWhitespace(rawService.text),
        // the image is set as a CSS variable: style="--bg-image: url('images/…')"
        imageUrl: rawService.backgroundStyle?.match(/url\(\s*['"]?([^'")]+)/)?.[1] ?? '',
    }));
}

// Groups of services that share the same value, e.g. ['„Hagelschaden“, „Hagelschaden II“'].
// Services without a value are skipped – missing content is reported by the test under "Tab switching".
function findServicesWithSameValue(services: Service[], property: 'text' | 'imageUrl') {
    const namesByValue = new Map<string, string[]>();
    for (const service of services) {
        const value = service[property];
        if (value === '') continue;
        namesByValue.set(value, [...(namesByValue.get(value) ?? []), `„${service.name}“`]);
    }
    return [...namesByValue.values()].filter(names => names.length > 1).map(names => names.join(', '));
}

// ─── Setup ──────────────────────────────────────────────────────

// Every test starts on the page. Without service tabs there would be nothing to check,
// and the tests would pass without having tested anything.
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.services__tab'), 'Keine Service-Tabs vorhanden (Klasse .services__tab)').not.toHaveCount(0);
});

// ─── Tab switching ──────────────────────────────────────────────

test('Leistungen: Klick auf eine Leistung zeigt ihr Panel mit Text und Hintergrundbild', expectedResult(
    'Nach jedem Klick ist der Tab aktiv und nur sein Panel sichtbar, mit Text und Hintergrundbild'
), async ({ page }) => {
    const tabs = page.locator('.services__tab');
    const tabCount = await tabs.count();

    for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        await tab.click();

        // find the panel that belongs to the tab
        const panelId = await tab.getAttribute('data-tab');
        const panel = page.locator(`#${panelId}`);

        await expect(tab, 'Tab ist nach Klick nicht aktiv').toHaveClass(/is-active/);
        // the tab's panel is visible…
        await expect(panel, `Panel #${panelId} wird nicht angezeigt`).toBeVisible();
        // …only this one and no others
        await expect(page.locator('.services__panel:visible'), 'Mehr als ein Panel sichtbar').toHaveCount(1);

        // the panel contains text, in one or several paragraphs
        // (the tests below check that it differs from the other services)
        await expect(panel.locator('.services__answer'), 'Text im Panel fehlt').toHaveText(/\S/);

        // a background image is set
        // (tests/images.spec.ts checks for the whole page whether the file can be loaded)
        const background = panel.locator('.services__bg');
        await expect(background, 'Kein Hintergrundbild hinterlegt').toHaveAttribute('style', /url\(/);
    }
});

// ─── Different content per service ──────────────────────────────

test('Leistungen: jede Leistung hat einen eigenen Text', expectedResult(
    'Kein Text steht bei mehr als einer Leistung'
), async ({ page }) => {
    const services = await readServices(page);
    expect(findServicesWithSameValue(services, 'text'), 'Diese Leistungen zeigen denselben Text').toEqual([]);
});

test('Leistungen: jede Leistung hat ein eigenes Hintergrundbild', expectedResult(
    'Kein Hintergrundbild wird bei mehr als einer Leistung verwendet'
), async ({ page }) => {
    const services = await readServices(page);
    expect(findServicesWithSameValue(services, 'imageUrl'), 'Diese Leistungen verwenden dasselbe Hintergrundbild').toEqual([]);
});
