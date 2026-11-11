// Generates dokuTestcases.md: all Playwright test cases with test file, test case and expected result.
// Usage: npm run writeDokuTestcases
//
// The expected result of the test case can be defined with expectedResult('…') in each test (see tests/helpers/addExpectedResult.ts).

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const OUTPUT_FILE = 'dokuTestcases.md';
const MISSING_RESULT = '⚠ noch nicht hinterlegt';

// One browser only – otherwise every test would be listed three times
const testListJson = execSync('npx playwright test --list --reporter=json --project=chromium', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
});
const report = JSON.parse(testListJson);

const rows = [];

// Test groups (describe) can be nested – join their titles into a path
function collectTests(suite, testFile, titlePath) {
    for (const spec of suite.specs ?? []) {
        const annotation = spec.tests[0]?.annotations.find(a => a.type === 'expectedResult');
        rows.push({
            testFile,
            testCase: [...titlePath, spec.title].join(' › '),
            expectedResult: annotation?.description ?? MISSING_RESULT,
        });
    }
    for (const subSuite of suite.suites ?? []) {
        collectTests(subSuite, testFile, [...titlePath, subSuite.title]);
    }
}

// Top level = one test file
for (const fileSuite of report.suites) {
    collectTests(fileSuite, fileSuite.file, []);
}

// A | would break the Markdown table; < would be read as the start of an HTML tag and the text would disappear
const escapeCell = text => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\|/g, '\\|');

const missingCount = rows.filter(row => row.expectedResult === MISSING_RESULT).length;
const generatedOn = new Date().toLocaleDateString('de-DE');

const markdown = [
    '# Testfälle',
    '',
    `Automatisch erzeugt am ${generatedOn} mit \`npm run writeDokuTestcases\` – nicht von Hand bearbeiten.`,
    '',
    `${rows.length} Testfälle, davon ${missingCount} ohne erwartetes Ergebnis.`,
    '',
    '| Testdatei | Testfall | Erwartetes Ergebnis |',
    '|---|---|---|',
    ...rows.map(row => `| ${escapeCell(row.testFile)} | ${escapeCell(row.testCase)} | ${escapeCell(row.expectedResult)} |`),
    '',
].join('\n');

writeFileSync(OUTPUT_FILE, markdown);
console.log(`${OUTPUT_FILE} geschrieben: ${rows.length} Testcases, ${missingCount} ohne erwartetes Ergebnis.`);
