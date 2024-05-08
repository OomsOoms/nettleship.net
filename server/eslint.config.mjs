import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: { ...globals.browser, process: true } } },
  pluginJs.configs.recommended,
  {
    ignores: ['**/*.test.js', '**/*.spec.js', 'docs/**', 'coverage/**'],
  },
  {
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];
