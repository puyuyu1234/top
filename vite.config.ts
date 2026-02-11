import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages: リポジトリ名に合わせる。カスタムドメインなら '/' でOK
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base,
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString("ja-JP")),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
