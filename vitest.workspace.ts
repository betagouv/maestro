import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      setupFiles: [],
      include: ['shared/**/*.test.ts', 'server/**/*.test.ts'],
      exclude: ['**/*.router.test.ts']
    }
  },
  {
    test: {
      name: 'integration',
      hookTimeout: 45000,
      root: 'server',
      setupFiles: ['./server/test/setupTests.ts'],
      include: ['**/*.router.test.ts']
    }
  }
]);
