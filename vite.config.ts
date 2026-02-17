import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'backgrounds/**/*', 'sprites/**/*', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Pokestudy Red',
        short_name: 'Pokestudy',
        description: 'A Pokémon-style study tracker that rewards your study sessions',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,webp}'],
        runtimeCaching: [
          {
            // Cache local sprites
            urlPattern: /\/sprites\/\d+\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-sprites',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            // Fallback cache for online sprites (if any somehow load)
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pokemon-data': ['./src/data/pokemonDatabase.ts', './src/data/pokemonStats.ts'],
        }
      }
    }
  }
}));
