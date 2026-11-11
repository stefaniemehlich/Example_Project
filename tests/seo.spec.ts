import { test, expect, type Page } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { normalizeWhitespace } from './helpers/normalizeWhitespace';

// ─── Helper functions ───────────────────────────────────────────

// One question with its answer, from the SEO schema or from the page
type FaqEntry = { question: string; answer: string };

// Read the SEO schema (JSON-LD block) of the given type from the page
async function readSchema(page: Page, schemaType: string) {
    const jsonBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const jsonBlock of jsonBlocks) {
        let data;
        try { data = JSON.parse(jsonBlock); }
        catch { throw new Error(`Ein SEO-Schema-Block ist kein gültiges JSON:\n${jsonBlock.slice(0, 200)} …`); }
        if (data['@type'] === schemaType) return data;
    }
    throw new Error(`Kein SEO-Schema vom Typ ${schemaType} gefunden`);
}

// Read the FAQ from the SEO schema (FAQPage)
async function readSchemaFaq(page: Page): Promise<FaqEntry[]> {
    const schema = await readSchema(page, 'FAQPage');
    return (schema.mainEntity ?? []).map((entry: { name?: string; acceptedAnswer?: { text?: string } }) => ({
        question: normalizeWhitespace(entry.name),
        answer: normalizeWhitespace(entry.acceptedAnswer?.text),
    }));
}

// Read the FAQ from the page
async function readPageFaq(page: Page): Promise<FaqEntry[]> {
    const entries = await page.locator('.faq__item').evaluateAll(items => items.map(item => ({
        question: item.querySelector('.faq__question')?.textContent ?? '',
        answer: item.querySelector('.faq__answer')?.textContent ?? '',
    })));
    return entries.map(entry => ({
        question: normalizeWhitespace(entry.question),
        answer: normalizeWhitespace(entry.answer),
    }));
}

// ─── Page basics ────────────────────────────────────────────────

// Google shows roughly 160 characters of the description in the search results;
// a much shorter text says too little about the page
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 160;

test('SEO: Meta-Description ist vorhanden und passend lang', expectedResult(
    `Es gibt genau eine Meta-Description mit ${MIN_DESCRIPTION_LENGTH}–${MAX_DESCRIPTION_LENGTH} Zeichen`
), async ({ page }) => {
    await page.goto('/');

    const descriptionElement = page.locator('meta[name="description"]');
    await expect(descriptionElement, 'Nicht genau eine Meta-Description').toHaveCount(1);

    const description = normalizeWhitespace(await descriptionElement.getAttribute('content'));
    expect(description.length, `Meta-Description zu kurz (${description.length} Zeichen, mind. ${MIN_DESCRIPTION_LENGTH})`)
        .toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
    expect(description.length, `Meta-Description zu lang (${description.length} Zeichen, höchstens ${MAX_DESCRIPTION_LENGTH})`)
        .toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
});

test('SEO: Seitensprache ist Deutsch', expectedResult(
    'Das <html>-Element hat lang="de"'
), async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html'), 'Seitensprache ist nicht Deutsch').toHaveAttribute('lang', 'de');
});

test('SEO: genau eine Hauptüberschrift (h1)', expectedResult(
    'Die Seite hat genau eine h1, sie ist sichtbar und hat Text'
), async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1, 'Nicht genau eine h1 auf der Seite').toHaveCount(1);
    await expect(h1, 'Die h1 ist nicht sichtbar').toBeVisible();
    await expect(h1, 'Die h1 hat keinen Text').not.toBeEmpty();
});

// ─── Business schema ────────────────────────────────────────────

test('SEO: Unternehmens-Schema ist vollständig und passt zur Adresse im Footer', expectedResult(
    'SEO-Schema AutoRepair enthält Name, URL, Telefon und vollständige Adresse; Straße, PLZ, Ort und Telefonnummer stehen so auch im Footer'
), async ({ page }) => {
    await page.goto('/');

    const schema = await readSchema(page, 'AutoRepair');
    const address = schema.address ?? {};

    const requiredValues = {
        'name': schema.name,
        'url': schema.url,
        'telephone': schema.telephone,
        'address.streetAddress': address.streetAddress,
        'address.postalCode': address.postalCode,
        'address.addressLocality': address.addressLocality,
        'address.addressCountry': address.addressCountry,
    };
    // expect.soft: the test keeps running, all failures are reported together at the end
    for (const [property, value] of Object.entries(requiredValues)) {
        expect.soft(normalizeWhitespace(value), `Im Unternehmens-Schema fehlt „${property}“`).not.toBe('');
    }

    // Google requires that the schema matches what visitors see on the page.
    const footerAddress = page.locator('.footer__address');
    for (const property of ['streetAddress', 'postalCode', 'addressLocality']) {
        await expect.soft(footerAddress, `„${property}“ aus dem Schema steht nicht in der Adresse im Footer`)
            .toContainText(String(address[property]));
    }

    // The phone number is written with spaces in the footer and without in the schema – compare without spaces
    const footerText = ((await footerAddress.textContent()) ?? '').replace(/\s/g, '');
    expect.soft(footerText, 'Telefonnummer aus dem Schema steht nicht in der Adresse im Footer')
        .toContain(String(schema.telephone).replace(/\s/g, ''));
});

// ─── Fonts ──────────────────────────────────────────────────────

test('SEO: Google Fonts werden mit font-display: swap eingebunden', expectedResult(
    'Jeder Google-Fonts-Link enthält display=swap, jede eigene @font-face-Regel font-display: swap'
), async ({ page }) => {
    // Project rule: without swap the text stays invisible while the font loads
    await page.goto('/');

    // Read the links from the loaded page: the browser has already turned &amp; into &
    const fontLinks = await page.locator('link[href^="https://fonts.googleapis.com/css"]').evaluateAll(
        links => links.map(link => (link as HTMLLinkElement).href),
    );
    const styles = (await page.locator('style').allTextContents()).join('\n');
    const fontFaceRules = [...styles.matchAll(/@font-face\s*\{[^}]*\}/g)].map(match => match[0]);
    expect(fontLinks.length + fontFaceRules.length, 'Keine Schriften eingebunden (Google-Fonts-Link oder @font-face)').toBeGreaterThan(0);

    const linksWithoutSwap = fontLinks.filter(link => new URL(link).searchParams.get('display') !== 'swap');
    expect(linksWithoutSwap, 'Google-Fonts-Link ohne display=swap').toEqual([]);

    const rulesWithoutSwap = fontFaceRules.filter(rule => !/font-display\s*:\s*swap/.test(rule));
    expect(rulesWithoutSwap, '@font-face-Regel ohne font-display: swap').toEqual([]);
});

// ─── FAQ ────────────────────────────────────────────────────────

test('SEO: FAQ-Schema und FAQ auf der Seite sind gleich', expectedResult(
    'Anzahl, Fragen und Antworten der FAQ auf der Seite stimmen mit dem SEO-Schema (FAQPage) überein'
), async ({ page }) => {
    await page.goto('/');

    // The SEO schema is the reference: Google requires that exactly these questions
    // and answers are also visible on the page
    const schemaFaq = await readSchemaFaq(page);
    expect(schemaFaq.length, 'Das SEO-Schema enthält keine Fragen').toBeGreaterThan(0);

    const pageFaq = await readPageFaq(page);
    // expect.soft: the test keeps running, all differences are reported together at the end
    expect.soft(pageFaq.length, `Die FAQ hat ${pageFaq.length} Fragen, das SEO-Schema ${schemaFaq.length}`).toBe(schemaFaq.length);

    for (let i = 0; i < Math.min(pageFaq.length, schemaFaq.length); i++) {
        expect.soft(pageFaq[i].question, `Frage Nr. ${i + 1}: Frage weicht vom SEO-Schema ab`).toBe(schemaFaq[i].question);
        expect.soft(pageFaq[i].answer, `Frage Nr. ${i + 1}: Antwort weicht vom SEO-Schema ab`).toBe(schemaFaq[i].answer);
    }
});

// ─── Images ─────────────────────────────────────────────────────

// tests/images.spec.ts checks that the images can be loaded

test('SEO: alle <img>-Bilder haben einen Alt-Text', expectedResult(
    'Jedes <img> hat ein alt-Attribut; ein leerer Alt-Text steht nur bei dekorativen Bildern (aria-hidden="true")'
), async ({ page }) => {
    await page.goto('/');

    const errors = await page.locator('img').evaluateAll(images => {
        const messages: string[] = [];
        for (const image of images) {
            const imageUrl = image.getAttribute('src');
            const alt = image.getAttribute('alt');
            // alt="" is only correct for purely decorative images –
            // those must mark it explicitly with aria-hidden="true"
            const isDecorative = image.getAttribute('aria-hidden') === 'true';
            if (alt === null) messages.push(`${imageUrl}: kein alt-Attribut`);
            else if (alt.trim() === '' && !isDecorative) messages.push(`${imageUrl}: leerer alt-Text, aber nicht als dekorativ markiert (aria-hidden="true")`);
        }
        // slide copies produce the same messages – remove duplicates
        return [...new Set(messages)];
    });

    expect(errors, 'Alt-Texte fehlen').toEqual([]);
});
