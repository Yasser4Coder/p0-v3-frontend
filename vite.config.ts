import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { RuntimeCaching } from "workbox-build";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { PWA_CACHE_VERSION } from "./src/config/pwaCacheVersion";

function escapeRegExpChars(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let apiUrlPrefix: string | null = null;
  try {
    const raw = env.VITE_API_URL?.trim();
    if (raw) {
      apiUrlPrefix = raw.replace(/\/$/, "");
    }
  } catch {
    apiUrlPrefix = null;
  }

  const runtimeCaching: RuntimeCaching[] = [
    {
      urlPattern: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: `p0-images-${PWA_CACHE_VERSION}`,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === "font",
      handler: "CacheFirst",
      options: {
        cacheName: `p0-fonts-${PWA_CACHE_VERSION}`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
  ];

  if (apiUrlPrefix) {
    const apiPattern = new RegExp(`^${escapeRegExpChars(apiUrlPrefix)}`);
    runtimeCaching.push({
      urlPattern: ({ url, request }) =>
        request.method === "GET" && apiPattern.test(url.href),
      handler: "NetworkFirst",
      options: {
        cacheName: `p0-api-${PWA_CACHE_VERSION}`,
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 5,
        },
      },
    });
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          cacheId: `p0-hxh-${PWA_CACHE_VERSION}`,
          globPatterns: [
            "**/*.{js,css,html,svg,png,webp,mp4,gif,jpg,mp3}",
          ],
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
          runtimeCaching,
        },
      }),
    ],
  };
});
