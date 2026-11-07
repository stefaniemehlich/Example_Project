import { test, expect, type Page } from '@playwright/test';

// Leerraum (Zeilenumbrüche, Einrückungen, schmale Leerzeichen wie &thinsp;)
// zu einem normalen Leerzeichen zusammenfassen
function bereinigt(text: string | null | undefined) {
    return (text ?? '').replace(/\s+/g, ' ').trim();
}

type FaqEintrag = { frage: string; antwort: string };

// FAQ aus dem SEO-Schema (FAQPage) lesen
async function schemaFaq(page: Page): Promise<FaqEintrag[]> {
    const jsonBloecke = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const block of jsonBloecke) {
        let daten;
        try { daten = JSON.parse(block); }
        catch { throw new Error(`Ein SEO-Schema-Block ist kein gültiges JSON:\n${block.slice(0, 200)} …`); }
        if (daten['@type'] === 'FAQPage')
            return (daten.mainEntity ?? []).map((q: { name?: string; acceptedAnswer?: { text?: string } }) => ({
                frage: bereinigt(q.name),
                antwort: bereinigt(q.acceptedAnswer?.text),
            }));
    }
    throw new Error('Kein SEO-Schema vom Typ FAQPage gefunden');
}

// FAQ von der Seite lesen
async function seitenFaq(page: Page): Promise<FaqEintrag[]> {
    return page.locator('.faq__item').evaluateAll(eintraege => eintraege.map(e => ({
        frage: e.querySelector('.faq__question')?.textContent ?? '',
        antwort: e.querySelector('.faq__answer')?.textContent ?? '',
    }))).then(liste => liste.map(f => ({ frage: bereinigt(f.frage), antwort: bereinigt(f.antwort) })));
}

// ─── FAQ ────────────────────────────────────────────────────────

test('FAQ: SEO-Schema und FAQ auf der Seite sind gleich', async ({ page }) => {
    await page.goto('/');

    // Das SEO-Schema ist die Vorlage: Google verlangt, dass genau diese Fragen
    // und Antworten auch sichtbar auf der Seite stehen
    const schema = await schemaFaq(page);
    expect(schema.length, 'Das SEO-Schema enthält keine Fragen').toBeGreaterThan(0);

    const faq = await seitenFaq(page);
    // expect.soft: Test läuft weiter, am Ende werden alle Abweichungen gemeinsam gemeldet
    expect.soft(faq.length, `Die FAQ hat ${faq.length} Fragen, das SEO-Schema ${schema.length}`).toBe(schema.length);

    for (let i = 0; i < Math.min(faq.length, schema.length); i++) {
        expect.soft(faq[i].frage, `Frage Nr. ${i + 1}: Frage weicht vom SEO-Schema ab`).toBe(schema[i].frage);
        expect.soft(faq[i].antwort, `Frage Nr. ${i + 1}: Antwort weicht vom SEO-Schema ab`).toBe(schema[i].antwort);
    }
});

// ─── Bilder ─────────────────────────────────────────────────────

test('alle <img>-Bilder haben einen Alt-Text', async ({ page }) => {
    await page.goto('/');

    const fehler = await page.locator('img').evaluateAll(bilder => {
        const meldungen: string[] = [];
        for (const b of bilder) {
            const src = b.getAttribute('src');
            const alt = b.getAttribute('alt');
            // alt="" ist nur für rein dekorative Bilder richtig –
            // die müssen das ausdrücklich mit aria-hidden="true" markieren
            const dekorativ = b.getAttribute('aria-hidden') === 'true';
            if (alt === null) meldungen.push(`${src}: kein alt-Attribut`);
            else if (alt.trim() === '' && !dekorativ) meldungen.push(`${src}: leerer alt-Text, aber nicht als dekorativ markiert (aria-hidden="true")`);
        }
        // Slide-Kopien liefern dieselben Meldungen – doppelte entfernen
        return [...new Set(meldungen)];
    });

    expect(fehler, 'Alt-Texte fehlen').toEqual([]);
});
