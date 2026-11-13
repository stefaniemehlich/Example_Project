import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default defineConfig(
  globalIgnores(['playwright-report/', 'test-results/', '.agents/', '.claude/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/expect-expect': ['warn', {
        assertFunctionPatterns: ['^check', '^expect', '^runScenario$', '^closeThankYouView$'],
      }],
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      'playwright/no-identical-title': 'off',
      'playwright/valid-test-tags': 'off',
    },
  },
  // forgotten await (e.g. page.goto() or locator.click() without await) – needs the type information from tsconfig.json
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true } },
    rules: { '@typescript-eslint/no-floating-promises': 'error' },
  },
  { files: ['scripts/**/*.mjs'], languageOptions: { globals: globals.node } },
);
