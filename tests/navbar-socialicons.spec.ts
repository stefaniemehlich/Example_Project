import { test } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { type ExternalLink, checkExternalLink } from './helpers/checkExternalLink';

// ─── Test data ──────────────────────────────────────────────────

// social icons to be checked
const socialLinks: ExternalLink[] = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'TikTok', url: 'https://tiktok.com' },
];

// ─── Tests ──────────────────────────────────────────────────────

for (const link of socialLinks) {
    test(`Navbar: Social-Icon ${link.name} öffnet in neuem Tab`, expectedResult(
        `Link führt auf ${link.url} (target="_blank", rel="noopener"); Klick öffnet ${link.name} in neuem Tab`
    ), async ({ page }) => {
        // the header: on desktop the social icons sit there, the copies in the mobile bar are hidden
        await checkExternalLink(page.getByRole('banner'), link);
    });
}
