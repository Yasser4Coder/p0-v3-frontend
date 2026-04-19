import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(), VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,mp4,gif,jpg,mp3}"],
        // Default 2 MiB excludes large hero/media assets from precache and fails the build.
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
      },
    }),],
})
