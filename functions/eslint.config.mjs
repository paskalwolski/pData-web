import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import {defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ["lib", "generated"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      quotes: ["error", "double"],
      indent: ["error", 2],
    },
  },
);
