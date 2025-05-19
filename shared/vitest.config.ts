import { defineConfig } from 'vitest/config';
import RandomSeed from '../test/vitest-random-seed';

export default defineConfig({
  plugins: [RandomSeed()],
  test: {
    setupFiles: ['../test/setupFakerJS.ts']
  }
});
