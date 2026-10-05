import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
  {
    rules: {
      'no-useless-escape': 'off',
      "no-debugger": 'off',
      '@typescript-eslint/no-explicit-any': "warn",
      "@typescript-eslint/no-unused-expressions": 'off',
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
]);
