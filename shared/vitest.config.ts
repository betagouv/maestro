import { defineConfig, ViteUserConfig } from 'vitest/config';
import { RandomSeed } from '../test/vitest-random-seed';

const config: ViteUserConfig = defineConfig({
  plugins: [RandomSeed()],
  test: {
    setupFiles: ['../test/setupFakerJS.ts']
  }

})


export default config