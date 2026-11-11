import { expect, type Locator } from '@playwright/test';

// A link that opens another website in a new tab
export type ExternalLink = {
    name: string;   // accessible name of the link (visible text or aria-label)
    url: string;    // external page the link opens, e.g. 'https://facebook.com'
};

// Click the link inside the given area (e.g. the social icons in the navbar)
// and check that its page opens in a new tab
export async function checkExternalLink(area: Locator, link: ExternalLink) {
    const page = area.page();
    // complete address as the browser shows it (adds the trailing slash to 'https://facebook.com')
    const url = new URL(link.url);

    // Do not load the real website – intercept all requests to it and return a placeholder page
    await page.context().route(`${url.origin}/**`, route =>
        route.fulfill({ contentType: 'text/html', body: `<h1>${link.name} (Test)</h1>` })
    );

    await page.goto('/');

    const linkElement = area.getByRole('link', { name: link.name, exact: true });

    // correct link target in the HTML
    await expect(linkElement).toHaveAttribute('href', link.url);
    await expect(linkElement).toHaveAttribute('target', '_blank');
    await expect(linkElement).toHaveAttribute('rel', /noopener/);

    // click and wait for the new tab
    const newTabPromise = page.waitForEvent('popup');
    await linkElement.click();
    const newTab = await newTabPromise;

    // the new tab shows the external page
    await expect(newTab).toHaveURL(url.href);
}
