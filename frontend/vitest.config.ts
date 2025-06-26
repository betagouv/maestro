import path from 'path';
import { loadConfigFromFile, mergeConfig, type ConfigEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(async (env: ConfigEnv) => {
  const configPath = path.resolve(__dirname, 'vite.config.ts');

  const { config: viteConfig } =
    (await loadConfigFromFile(env, configPath)) || {};

  return mergeConfig(viteConfig ?? {}, {
    test: {
      setupFiles: ['./.storybook/vitest.setup.ts'],
      include: ['src/**/*.stories.@(ts|tsx)', 'src/**/*.test.@(ts|tsx)'],
      environment: 'jsdom',
      globals: true
    }
  });
});
