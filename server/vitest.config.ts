import { defineConfig } from 'vitest/config';
import RandomSeed from '../test/vitest-random-seed.mts';

const integrationTestFiles = [
  '**/*.router.test.ts',
  '**/repositories/*.test.ts',
  '**/*.integration.test.ts'
];
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [RandomSeed()],
        test: {
          name: 'unit',
          setupFiles: ['../test/setupFakerJS.ts'],
          include: ['**/*.test.ts'],
          exclude: integrationTestFiles
        }
      },
      {
        plugins: [RandomSeed()],
        test: {
          name: 'integration',
          execArgv: ['--max-http-header-size=8192'],
          hookTimeout: 45000,
          testTimeout: 30000,
          globalSetup: ['./test/globalSetup.ts'],
          setupFiles: ['../test/setupFakerJS.ts', './test/setupTests.ts'],
          include: integrationTestFiles
        }
      }
    ]
  }
});
