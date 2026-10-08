import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Files ESLint never looks at (build output, deps, coverage, service worker).
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".scannerwork/**",
      "study/**",
      "public/sw.js",
    ],
  },

  // Baseline rule sets — turned ON (this is the "strict" part).
  js.configs.recommended, // core JS best-practice rules
  ...tseslint.configs.recommended, // TypeScript best-practice rules
  react.configs.flat.recommended, // React rules incl. jsx-key, no-unescaped-entities, etc.
  react.configs.flat["jsx-runtime"], // modern JSX transform (no need to import React)

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Unused variables/args/errors are now hard errors (opt out with a `_` prefix).
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Explicit `any` is now flagged — the main thing that hides type bugs.
      "@typescript-eslint/no-explicit-any": "error",

      // TypeScript checks undefined names better than ESLint, so leave this off.
      "no-undef": "off",

      // Stray console.log warns; console.error/warn are allowed.
      "no-console": ["warn", { allow: ["error", "warn"] }],

      // prop-types is redundant in a TypeScript project (types do this job).
      "react/prop-types": "off",

      // Hooks correctness — breaking these genuinely breaks React.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Vite fast-refresh health; allow exporting constants alongside components.
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Tests: relax the noisy rules (mocks/fixtures, console output, etc.).
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "src/test/**/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "off",
      "react/display-name": "off",
    },
  }
);
