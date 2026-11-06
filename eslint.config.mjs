import js from '@eslint/js';
import globals from 'globals';
import next from 'eslint-config-next';

export default [
  { ignores: ['**/.next/**', '**/node_modules/**', '**/dist/**', '**/*.d.ts', 'pnpm-lock.yaml'] },
  js.configs.recommended,
  ...next,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
