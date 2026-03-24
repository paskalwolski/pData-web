import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

let customConfig = [];
let hasIgnoresFile = false;
try {
  await import('./eslint.ignores.js');
  hasIgnoresFile = true;
} catch {
  // eslint.ignores.js doesn't exist
}

if (hasIgnoresFile) {
  const { default: ignores } = await import('./eslint.ignores.js');
  customConfig = [{ ignores }];
}

export default [
  ...customConfig,
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
];
