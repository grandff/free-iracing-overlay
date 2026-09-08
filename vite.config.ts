import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// ponytail: minimal vite config for ultra-lightweight overlay
export default defineConfig({
  plugins: [solidPlugin()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    // Loopback only. `host: "0.0.0.0"` + `allowedHosts: true` published the dev
    // server, and its module graph, to every device on the network and turned off
    // DNS-rebinding protection. Tauri loads devUrl over localhost, so neither is needed.
    host: "127.0.0.1",
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
  },
});
