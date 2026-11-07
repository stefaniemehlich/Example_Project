// Erwartetes Ergebnis eines Tests festhalten.
// Erscheint im HTML-Testbericht und in der Testfall-Übersicht (npm run testfaelle).
//
// Beispiel:
//   test('Button öffnet das Overlay', expectedResult('Overlay ist geöffnet'), async ({ page }) => { … });
export function expectedResult(beschreibung: string) {
    return { annotation: { type: 'expectedResult', description: beschreibung } };
}
