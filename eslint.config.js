import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      // Legacy Backbone-era panel assets in public/ — copied verbatim, replaced in Phase 3.
      'public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
      },
    },
  },
);
