import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  //it doesn't check for this folder
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "public/sw.js"],
  },
  //use eslint recommended js rules like unused variable and other js mistake.
  js.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    //globalOptions in language allows ur backend to have browser variable without flagging them like window
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      //it gives the information about how and which style we have written the ts code like (import/export) etc
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    //checks the react downloaded version
    settings: {
      react: {
        version: "detect",
      },
    },
    //rules that we want the eslint to find and detect in the application
    //warn gives yellow signal and error gives red signal 
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
