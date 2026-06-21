import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/uploads": { target: "http://localhost:5000", changeOrigin: true },
    },
    // allow tunneling through ngrok (and any *.ngrok-free.dev / *.ngrok.app host)
    allowedHosts: [
      "quentin-plastered-worriedly.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.app",
      ".ngrok.io",
    ],
  },
});
