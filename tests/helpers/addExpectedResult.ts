// Records the expected result of a test.
// Shown in the HTML test report and in the test case overview (npm run writeDokuTestcases).
//
// Example:
//   test('Button öffnet das Overlay', expectedResult('Overlay ist geöffnet'), async ({ page }) => { … });
export function expectedResult(description: string) {
    return { annotation: { type: 'expectedResult', description: description } };
}
