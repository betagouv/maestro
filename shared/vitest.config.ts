import { defineConfig } from 'vitest/config';
import RandomSeed from '../test/vitest-random-seed.mts';

export default defineConfig({
  plugins: [RandomSeed()],
  test: {
    setupFiles: ['../test/setupFakerJS.ts']
  }
});
