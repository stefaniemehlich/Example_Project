import { expect, type Page } from '@playwright/test';

// Gemeinsame Hilfsfunktionen für alle Slider (Galerie, Bewertungen)

// Beschreibung eines Sliders für die gemeinsamen Prüfungen
export type Slider = {
    name: string;                            // für Fehlermeldungen, z. B. 'Galerie'
    weiter: string;                          // Selektor des Pfeils „weiter“
    zurueck: string;                         // Selektor des Pfeils „zurück“
    aktiv: (page: Page) => Promise<string>;  // Kennung des aktiven Slides (z. B. Bild-Adresse oder Name)
};

// Seite mit angehaltener Uhr öffnen: Auto-Play und Zeitverzögerungen
// laufen nur weiter, wenn der Test die Zeit selbst vorspult.
export async function oeffneMitAngehaltenerUhr(page: Page) {
    const startzeit = new Date('2026-01-01T10:00:00');
    await page.clock.install({ time: startzeit });
    // install() allein lässt die Uhr normal weiterlaufen – daher anhalten
    await page.clock.pauseAt(new Date(startzeit.getTime() + 1000));
    await page.goto('/');
    // Einblend-Animation (.reveal) abschalten: Sie lässt die Galerie beim ersten Sichtbarwerden
    // hochgleiten, läuft mit angehaltener Uhr in Firefox nicht zuverlässig zu Ende
    // und ein Klick auf den sich bewegenden Pfeil kann danebengehen.
    await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
    // kurz vorspulen, damit die Scripts die Slider sichtbar schalten
    await page.clock.runFor(100);
}

// Pfeil klicken und warten, bis Animation + Rücksprung fertig sind (620 ms im Code)
export async function klickePfeil(page: Page, selektor: string) {
    await page.locator(selektor).click();
    await page.clock.runFor(700);
}

// Auto-Play-Takt aus dem Quelltext lesen. Das Muster muss genau einmal vorkommen,
// die Millisekunden stehen in der ersten Klammer des Musters.
export async function taktAusQuelltext(page: Page, muster: RegExp, erwartet: string) {
    const quelltext = await (await page.request.get('/')).text();
    const treffer = [...quelltext.matchAll(new RegExp(muster.source, 'g'))];
    expect(treffer.length, `Kein Auto-Play-Takt im Code gefunden (erwartet: ${erwartet})`).toBeGreaterThan(0);
    // genau eine Stelle – sonst ist unklar, welcher Takt gilt
    expect(treffer.length,
        `Auto-Play-Takt mehrfach im Code gefunden: ${treffer.map(t => t[0]).join(', ')}`).toBe(1);
    return Number(treffer[0][1]);
}

// „weiter“ wechselt den Slide, „zurück“ führt wieder zum vorherigen
export async function pruefePfeile(page: Page, s: Slider) {
    const start = await s.aktiv(page);

    await klickePfeil(page, s.weiter);
    expect(await s.aktiv(page), `${s.name}: Pfeil „weiter“ wechselt nicht`).not.toBe(start);

    await klickePfeil(page, s.zurueck);
    expect(await s.aktiv(page), `${s.name}: Pfeil „zurück“ führt nicht zum vorherigen Slide`).toBe(start);
}

// So oft „weiter“ klicken, wie es Slides gibt: Jeder kommt genau einmal dran,
// danach geht es von vorn los. „Zurück“ vom ersten Slide führt zum letzten.
export async function pruefeEndlosSchleife(page: Page, s: Slider, anzahl: number) {
    expect(anzahl, `${s.name}: Für eine Schleife braucht es mindestens 2 Slides`).toBeGreaterThan(1);

    const gesehen = [await s.aktiv(page)];
    for (let i = 0; i < anzahl; i++) {
        await klickePfeil(page, s.weiter);
        gesehen.push(await s.aktiv(page));
    }

    expect(new Set(gesehen.slice(0, anzahl)).size,
        `${s.name}: Nicht jeder Slide wurde einmal gezeigt (Reihenfolge: ${gesehen.join(' → ')})`).toBe(anzahl);
    expect(gesehen[anzahl], `${s.name}: Nach einer Runde nicht wieder beim ersten Slide`).toBe(gesehen[0]);

    await klickePfeil(page, s.zurueck);
    expect(await s.aktiv(page), `${s.name}: „Zurück“ vom ersten Slide zeigt nicht den letzten`).toBe(gesehen[anzahl - 1]);
}

// Kurz vor Ablauf des Takts noch derselbe Slide, kurz danach ein neuer.
// Direkt nach oeffneMitAngehaltenerUhr aufrufen (dort sind schon 100 ms vergangen).
export async function pruefeAutoplay(page: Page, s: Slider, takt: number) {
    const start = await s.aktiv(page);

    await page.clock.runFor(takt - 200);
    expect(await s.aktiv(page), `${s.name}: wechselt früher als nach ${takt} ms`).toBe(start);

    await page.clock.runFor(300);
    expect(await s.aktiv(page), `${s.name}: kein automatischer Wechsel nach ${takt} ms`).not.toBe(start);
}
