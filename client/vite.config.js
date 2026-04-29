import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force the self-contained browser build — the default index.js
      // requires Node.js built-ins (events, stream, buffer) that don't
      // exist in the browser and cause runtime crashes.
      "simple-peer": "simple-peer/simplepeer.min.js",
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
