import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/',
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT || '3000', 10),
      open: true
    },
    preview: {
      port: 3000
    },
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        manifest: false,
        srcDir: 'src',
        strategies: 'injectManifest',
        filename: 'serviceWorker.js',
        injectManifest: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        }
      })
    ]
  };
});
