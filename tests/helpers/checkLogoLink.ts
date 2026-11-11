import { expect, type Locator } from '@playwright/test';
import { scrollToBottom } from './scroll';

// Accessible name of the logo link (alt text of the logo image)
const LOGO_NAME = 'Dellen Company Logo';

// Click the logo inside the given area (e.g. navbar or footer)
// and check that the page jumps back to the very top
export async function checkLogoLink(area: Locator) {
    const page = area.page();
    await page.goto('/');

    const logoLink = area.getByRole('link', { name: LOGO_NAME, exact: true });

    // correct link target in the HTML
    await expect(logoLink).toHaveAttribute('href', '#');

    // scroll down first – at the top of the page the click would change nothing
    await scrollToBottom(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await logoLink.click();
    // URL ends with the empty anchor after the click
    await expect(page).toHaveURL(/#$/);
    // page is back at the very top (smooth scrolling takes a moment)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}
