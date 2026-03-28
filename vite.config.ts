import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["localhost", "127.0.0.1", "meeshh.tailcd5898.ts.net"],
  },
});
