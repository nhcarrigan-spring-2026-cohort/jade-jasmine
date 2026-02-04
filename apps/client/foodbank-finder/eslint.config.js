import js from "@eslint/js";
import globals from "globals";
import astroPlugin from "eslint-plugin-astro";

export default [
  // 1. Standard JS Rules
  js.configs.recommended,

  // 2. Astro Plugin Rules
  ...astroPlugin.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Astro often uses Node for build-time scripts
      },
    },
    rules: {
      // Add custom rules here
      "no-unused-vars": "warn",
    },
  },

  {
    ignores: ["dist/", ".astro/", "node_modules/"]
  }
];