import { defineWorkspace } from 'vitest/config'

const integrationTestFiles = ['**/*.router.test.ts', '**/repositories/*.test.ts']
export default defineWorkspace([
  {
    test: {
      name: 'unit',
      setupFiles: [],
      include: ['shared/**/*.test.ts', 'server/**/*.test.ts'],
      exclude: integrationTestFiles,
    },
  },
  {
    test: {
      name: 'integration',
      hookTimeout: 45000,
      root: 'server',
      setupFiles: ['./server/test/setupTests.ts'],
      include: integrationTestFiles,
    },
  },
])