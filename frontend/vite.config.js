import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
    assetsInclude: ["**/*.mp3", "**/*.png"],
  },
  publicDir: "public",
  base: "/",
});
