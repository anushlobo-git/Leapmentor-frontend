import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**", "public/sw.js"] },
  js.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react/jsx-uses-react": "warn",
      "react/jsx-uses-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },
];
