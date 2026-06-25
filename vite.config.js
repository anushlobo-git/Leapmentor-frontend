import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 2. Now __dirname will work perfectly here
      "@atoms": path.resolve(__dirname, "./src/atoms"),
      "@molecules": path.resolve(__dirname, "./src/molecules"),
      "@organisms": path.resolve(__dirname, "./src/organisms"),
      "@templates": path.resolve(__dirname, "./src/templates"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@context": path.resolve(__dirname, "./src/context"),
    },
  },
  build: {
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          "vendor-clerk": ["@clerk/clerk-react"],
        },
      },
    },
  },
});


