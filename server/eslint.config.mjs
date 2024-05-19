import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// Define your ESLint configuration
export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: { ...globals.browser, process: true } } },
  pluginJs.configs.recommended,
  {
    ignores: ['**/*.test.js', '**/*.spec.js', 'docs/**', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    rules: {
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
        },
      ],
      'no-unused-vars': [
        1,
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: 'res|next|^err|^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
];
