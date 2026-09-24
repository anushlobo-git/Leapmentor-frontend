//This line tells the typescript to add the test key:value which is not a property of defineConfig of vite.config.ts
//this line adds the vitest configuration that is test:{} in  vite.config.ts
/// <reference types="vitest/config" />

//we import the vite function to write the vite configuration defineConfig is a helper function
import { defineConfig } from "vite";
//imports react to vite when u run npm run dev this builds ur app
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  //installs the react and tailwind plugin 
  plugins: [react(), tailwindcss()],
  // Controls how Vite resolves imports.
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@test": path.resolve(__dirname, "./src/test"),
    },
  },
  //from vitest config ts this is the
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/app/**/*.{js,jsx,ts,tsx}",
        "src/features/**/*.{js,jsx,ts,tsx}",
        "src/components/**/*.{js,jsx,ts,tsx}",
        "src/lib/**/*.{js,jsx,ts,tsx}",
        "src/store/**/*.{js,jsx,ts,tsx}",
      ],
      exclude: [
        "node_modules/",
        "src/test/",
        "src/main.tsx",
        "src/**/*.test.{js,jsx,ts,tsx}",
        "src/**/*.stories.{js,jsx,ts,tsx}",
        "src/constants/**",
        "src/config/**",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  build: {
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
});
