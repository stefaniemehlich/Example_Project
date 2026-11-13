import { type Page } from '@playwright/test';

// Shared helper functions for scrolling the page

// Jump to a position on the page
export async function scrollToY(page: Page, y: number) {
    await page.evaluate(target => window.scrollTo({ top: target, behavior: 'instant' }), y);
}

// Jump to a section (index = position in the HTML, starting at 0)
export async function scrollToSection(page: Page, index: number) {
    const y = await page.locator('section').nth(index).evaluate(
        element => element.getBoundingClientRect().top + window.scrollY,
    );
    await scrollToY(page, y);
}

// Jump to the very end of the page
export async function scrollToBottom(page: Page) {
    await scrollToY(page, await page.evaluate(() => document.documentElement.scrollHeight));
}

// Scroll through the whole page one screen at a time, so lazy images start loading
// and every section has been in view once
export async function scrollThroughPage(page: Page) {
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = page.viewportSize()!.height;
    for (let y = 0; y < pageHeight; y += viewportHeight) {
        await scrollToY(page, y);
        // short pause so the browser notices the new position and requests the images now in view
        // eslint-disable-next-line playwright/no-wait-for-timeout -- bewusste kurze Pause, siehe Kommentar oben
        await page.waitForTimeout(100);
    }
}
