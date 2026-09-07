import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// ponytail: minimal vite config for ultra-lightweight overlay
export default defineConfig({
  plugins: [solidPlugin()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
  },
});
