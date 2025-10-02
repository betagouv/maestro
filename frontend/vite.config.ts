import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import RandomSeed from '../test/vitest-random-seed';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

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
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
        }
      })
    ],
    test: {
      projects: [
        {
          name: 'unit',
          include: ['test/**/*.test.ts?(x)', 'src/**/*.test.ts?(x)'],
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts']
        },
        {
          name: 'storybook',
          extends: true,
          optimizeDeps: {
            include: ['react/jsx-dev-runtime']
          },
          plugins: [
            RandomSeed(),
            react(),
            tsconfigPaths(),
            storybookTest({ configDir: path.join(dirname, '.storybook') })
          ],
          test: {
            name: 'storybook/test',
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [{ browser: 'chromium' }]
            },
            setupFiles: ['.storybook/vitest.setup.ts']
          }
        }
      ]
    }
  };
});
