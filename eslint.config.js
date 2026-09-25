import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignored directories and files
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "public/sw.js"],
  },
  // Recommended JS & TS configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": "off",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },
  // Specific override for unit test files to avoid noise from mock utilities and test setups
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "src/test/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  }
);

