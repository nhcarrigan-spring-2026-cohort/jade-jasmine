import js from "@eslint/js";
import globals from "globals";

export default [
  // 1. Inherit the recommended JavaScript rules
  js.configs.recommended,

  {
    // 2. Target your backend files
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // CHANGE: Use node instead of browser
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 3. Add backend-specific preferences
      "no-console": "warn",        // Good for servers to avoid cluttering logs
      "no-unused-vars": "error",   // Keeps your API clean
      "prefer-const": "error",     // Encourages immutable data patterns
    },
  },

  // 4. Global ignores for the backend
  {
    ignores: ["node_modules/", "dist/", "coverage/", ".env"],
  },
];