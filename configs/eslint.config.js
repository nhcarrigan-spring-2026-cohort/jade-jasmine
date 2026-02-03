import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";

export default [
  // 1. Global Ignores
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/", "package-lock.json"]
  },

  // 2. JavaScript Configuration
  js.configs.recommended, // This replaces the "extends" inside the object
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.browser // Recommended to keep both if you use 'window' or 'process'
      } 
    },
  },

  // 3. Specialized Languages
  { 
    files: ["**/*.json"], 
    plugins: { json }, 
    language: "json/json" 
    // Note: Make sure @eslint/json is installed
  },
  { 
    files: ["**/*.md"], 
    plugins: { markdown }, 
    language: "markdown/gfm" 
  },
  { 
    files: ["**/*.css"], 
    plugins: { css }, 
    language: "css/css" 
  },
];