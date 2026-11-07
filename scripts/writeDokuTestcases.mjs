// Erzeugt dokuTestcases.md: alle Playwright-Testfälle mit Testdatei, Testfall und erwartetem Ergebnis.
// Aufruf: npm run writeDokuTestcases
//
// Die Tests werden dabei nicht ausgeführt, nur aufgelistet.
// Das erwartete Ergebnis kommt aus expectedResult('…') im jeweiligen Test (siehe tests/helpers/findExpectedResult.ts).

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const AUSGABE = 'dokuTestcases.md';
const FEHLT = '⚠ noch nicht hinterlegt';

// Nur ein Browser – sonst stünde jeder Test dreimal in der Liste
const json = execSync('npx playwright test --list --reporter=json --project=chromium', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
});
const bericht = JSON.parse(json);

const zeilen = [];

// Testgruppen (describe) können verschachtelt sein – Titel zu einem Pfad zusammensetzen
function sammle(gruppe, datei, pfad) {
    for (const spec of gruppe.specs ?? []) {
        const erwartet = spec.tests[0]?.annotations.find(a => a.type === 'erwartet')?.description;
        zeilen.push({
            datei,
            testfall: [...pfad, spec.title].join(' › '),
            erwartet: erwartet ?? FEHLT,
        });
    }
    for (const unter of gruppe.suites ?? []) {
        sammle(unter, datei, [...pfad, unter.title]);
    }
}

// Oberste Ebene = eine Testdatei
for (const dateiGruppe of bericht.suites) {
    sammle(dateiGruppe, dateiGruppe.file, []);
}

// | würde die Markdown-Tabelle zerschneiden
const zelle = text => text.replace(/\|/g, '\\|');

const fehlend = zeilen.filter(z => z.erwartet === FEHLT).length;
const stand = new Date().toLocaleDateString('de-DE');

const md = [
    '# Testfälle',
    '',
    `Automatisch erzeugt am ${stand} mit \`npm run writeDokuTestcases\` – nicht von Hand bearbeiten.`,
    '',
    `${zeilen.length} Testfälle, davon ${fehlend} ohne erwartetes Ergebnis.`,
    '',
    '| Testdatei | Testcase | Erwartetes Ergebnis |',
    '|---|---|---|',
    ...zeilen.map(z => `| ${zelle(z.datei)} | ${zelle(z.testfall)} | ${zelle(z.erwartet)} |`),
    '',
].join('\n');

writeFileSync(AUSGABE, md);
console.log(`${AUSGABE} geschrieben: ${zeilen.length} Testcases, ${fehlend} ohne erwartetes Ergebnis.`);
