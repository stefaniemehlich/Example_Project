import { expect, type Page } from '@playwright/test';

// Shared helper functions for all sliders (gallery, reviews)

// Describes a slider for the shared checks
export type Slider = {
    name: string;                                  // for error messages, e.g. 'Galerie'
    next: string;                                  // accessible name of the "next" arrow, e.g. 'Nächstes Bild'
    prev: string;                                  // accessible name of the "previous" arrow
    getActiveId: (page: Page) => Promise<string>;  // returns what identifies the active slide (e.g. image URL or name)
    // returns the position the indicator shows (progress bar or dots): 1 = first slide
    getIndicatorPosition: (page: Page, slideCount: number) => Promise<number>;
};

// Time to fast-forward after a click on an arrow:
// a bit longer than animation + jump back in the page's script (SLIDE_ANIM_MS = 620)
const ARROW_ANIMATION_MS = 700;

// Margins around the auto-play interval: check shortly before it ends and shortly after
const BEFORE_INTERVAL_MS = 200;
const AFTER_INTERVAL_MS = 100;

// ─── Helper functions ───────────────────────────────────────────

// Open the page with a paused clock: auto-play and delays
// only continue when the test fast-forwards the time itself.
export async function openWithPausedClock(page: Page) {
    // any fixed date works – it only has to be the same in every run
    const startTime = new Date('2026-01-01T10:00:00');
    await page.clock.install({ time: startTime });
    // install() alone lets the clock keep running – so pause it
    await page.clock.pauseAt(new Date(startTime.getTime() + 1000));
    await page.goto('/');
    // Switch off the reveal animation (.reveal): it slides the gallery up when it first becomes visible,
    // does not finish reliably in Firefox with a paused clock,
    // and a click on the moving arrow can miss.
    await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' });
    // fast-forward briefly so the scripts make the sliders visible
    await page.clock.runFor(100);
}

// Click an arrow and wait until animation + jump back are done
export async function clickArrow(page: Page, name: string) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.clock.runFor(ARROW_ANIMATION_MS);
}

// Read the auto-play interval from the source code. The pattern must occur exactly once,
// the milliseconds are in the first group of the pattern.
// patternDescription: readable form of the pattern for the error message
export async function readIntervalFromSource(page: Page, pattern: RegExp, patternDescription: string) {
    const source = await (await page.request.get('/')).text();
    const matches = [...source.matchAll(new RegExp(pattern.source, 'g'))];
    expect(matches.length, `Kein Auto-Play-Takt im Code gefunden (erwartet: ${patternDescription})`).toBeGreaterThan(0);
    // exactly one place – otherwise it is unclear which interval applies
    expect(matches,
        `Auto-Play-Takt mehrfach im Code gefunden: ${matches.map(match => match[0]).join(', ')}`).toHaveLength(1);
    return Number(matches[0][1]);
}

// ─── Checks ─────────────────────────────────────────────────────

// "next" changes the slide, "previous" leads back to the one before
export async function checkArrows(page: Page, slider: Slider) {
    const startSlide = await slider.getActiveId(page);

    await clickArrow(page, slider.next);
    expect(await slider.getActiveId(page), `${slider.name}: Pfeil „weiter“ wechselt nicht`).not.toBe(startSlide);

    await clickArrow(page, slider.prev);
    expect(await slider.getActiveId(page), `${slider.name}: Pfeil „zurück“ führt nicht zum vorherigen Slide`).toBe(startSlide);
}

// The indicator (progress bar or dots) shows the expected position: 1 = first slide
async function expectIndicatorPosition(page: Page, slider: Slider, slideCount: number, expectedPosition: number) {
    const position = await slider.getIndicatorPosition(page, slideCount);
    // toBeCloseTo: a progress bar width like 33.3333 % does not give an exact whole number
    expect(position, `${slider.name}: Anzeige steht nicht auf Position ${expectedPosition} von ${slideCount}`).toBeCloseTo(expectedPosition, 2);
}

// Click "next" as often as there are slides: each one is shown exactly once,
// then it starts over. "Previous" from the first slide leads to the last.
// The indicator shows the position of the active slide the whole time.
export async function checkEndlessLoop(page: Page, slider: Slider, slideCount: number) {
    expect(slideCount, `${slider.name}: Für eine Schleife braucht es mindestens 2 Slides`).toBeGreaterThan(1);

    // the start slide plus the slide after each click: slideCount + 1 entries
    const seenSlides = [await slider.getActiveId(page)];
    await expectIndicatorPosition(page, slider, slideCount, 1);
    for (let i = 0; i < slideCount; i++) {
        await clickArrow(page, slider.next);
        seenSlides.push(await slider.getActiveId(page));
        // position 2 after the first click, back to 1 after the last
        await expectIndicatorPosition(page, slider, slideCount, (i + 1) % slideCount + 1);
    }

    expect(new Set(seenSlides.slice(0, slideCount)).size,
        `${slider.name}: Nicht jeder Slide wurde einmal gezeigt (Reihenfolge: ${seenSlides.join(' → ')})`).toBe(slideCount);
    expect(seenSlides[slideCount], `${slider.name}: Nach einer Runde nicht wieder beim ersten Slide`).toBe(seenSlides[0]);

    await clickArrow(page, slider.prev);
    expect(await slider.getActiveId(page), `${slider.name}: „Zurück“ vom ersten Slide zeigt nicht den letzten`).toBe(seenSlides[slideCount - 1]);
    await expectIndicatorPosition(page, slider, slideCount, slideCount);
}

// Shortly before the interval ends still the same slide, shortly after a new one.
// Call right after openWithPausedClock (100 ms have already passed there).
export async function checkAutoplay(page: Page, slider: Slider, interval: number) {
    const startSlide = await slider.getActiveId(page);

    await page.clock.runFor(interval - BEFORE_INTERVAL_MS);
    expect(await slider.getActiveId(page), `${slider.name}: wechselt früher als nach ${interval} ms`).toBe(startSlide);

    await page.clock.runFor(BEFORE_INTERVAL_MS + AFTER_INTERVAL_MS);
    expect(await slider.getActiveId(page), `${slider.name}: kein automatischer Wechsel nach ${interval} ms`).not.toBe(startSlide);
}
