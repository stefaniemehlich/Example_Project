import { test } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { type AnchorLink, checkAnchorLink } from './helpers/checkAnchorLink';
import { checkLogoLink } from './helpers/checkLogoLink';

// ─── Test data ──────────────────────────────────────────────────

// links to be checked
const footerLinks: AnchorLink[] = [
    { name: 'Nachhaltigkeit', href: '#nachhaltigkeit' },
    { name: 'Galerie', href: '#galerie' },
    { name: 'Bewertungen', href: '#bewertungen' },
];

// ─── Tests ──────────────────────────────────────────────────────

for (const link of footerLinks) {
    test(`Footer: ${link.name} korrekt verlinkt`, expectedResult(
        `Link führt auf ${link.href}; nach dem Klick endet die URL auf ${link.href} und der Abschnitt ist im sichtbaren Bereich`
    ), async ({ page }) => {
        await checkAnchorLink(page.getByRole('contentinfo'), link);
    });
}

test('Footer: Logo führt zum Seitenanfang', expectedResult(
    'Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben'
), async ({ page }) => {
    await checkLogoLink(page.getByRole('contentinfo'));
});
