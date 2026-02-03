import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // 1. Next.js & TypeScript Core Rules
  ...nextVitals,
  ...nextTs,

  // 2. Custom Rule Overrides
  {
    rules: {
      "no-unused-vars": "warn",           // Don't fail the build for unused variables, just warn
      "@typescript-eslint/no-explicit-any": "error", // Force better typing by banning 'any'
      "react/self-closing-comp": "error", // Automatically fix <div pills></div> to <div pills />
      "prefer-const": "error",            // Better memory management and predictability
    },
  },

  // 3. Global Ignores (Keep these as you had them)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",  // Added: you don't want to lint your static assets
  ]),
]);

export default eslintConfig;