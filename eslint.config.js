import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  // negeer build/ en vendor
  { ignores: ['build/**', '.homeybuild/**', 'node_modules/**'] },

  // JS basisregels
  js.configs.recommended,

  // TypeScript basisregels
  ...tseslint.configs.recommended,

  // Onze TS bronbestanden
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
];
