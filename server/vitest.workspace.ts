import { defineWorkspace } from 'vitest/config';
import RandomSeed from '../test/vitest-random-seed';

const integrationTestFiles = [
  '**/*.router.test.ts',
  '**/repositories/*.test.ts',
  '**/*.integration.test.ts'
];
export default defineWorkspace([
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
      hookTimeout: 45000,
      setupFiles: ['../test/setupFakerJS.ts', './test/setupTests.ts'],
      include: integrationTestFiles
    }
  }
]);
