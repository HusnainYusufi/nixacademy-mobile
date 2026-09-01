import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// In dev we proxy /api → the production backend so the app can call real
// endpoints from localhost without CORS (set VITE_API_URL=/api/v1 in .env.development).
// In the built APK, VITE_API_URL is unset and the client uses the absolute prod URL.
const API_TARGET = process.env.API_TARGET ?? 'https://api.nixacademy.io';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    host: true,
    port: 5273,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: 'localhost',
        // The backend errors on a browser Origin it doesn't allowlist; drop it
        // (and Referer) so local dev behaves like a first-party call.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
