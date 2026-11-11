import { test } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { type AnchorLink, checkAnchorLink } from './helpers/checkAnchorLink';
import { checkLogoLink } from './helpers/checkLogoLink';

// ─── Test data ──────────────────────────────────────────────────

// links to be checked
const navbarLinks: AnchorLink[] = [
    { name: 'Leistungen', href: '#leistungen' },
    { name: 'Nachhaltigkeit', href: '#nachhaltigkeit' },
    { name: 'Galerie', href: '#galerie' },
    { name: 'Kontakt', href: '#kontakt' },
];

// ─── Tests ──────────────────────────────────────────────────────

for (const link of navbarLinks) {
    test(`Navbar: ${link.name} korrekt verlinkt`, expectedResult(
        `Link führt auf ${link.href}; nach dem Klick endet die URL auf ${link.href} und der Abschnitt ist im sichtbaren Bereich`
    ), async ({ page }) => {
        await checkAnchorLink(page.getByRole('navigation', { name: 'Hauptnavigation' }), link);
    });
}

// The logo sits in the header, outside the main navigation
test('Navbar: Logo führt zum Seitenanfang', expectedResult(
    'Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben'
), async ({ page }) => {
    await checkLogoLink(page.getByRole('banner'));
});
