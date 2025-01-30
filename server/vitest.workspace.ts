import { defineWorkspace } from 'vitest/config'

const integrationTestFiles = ['**/*.router.test.ts', '**/repositories/*.test.ts', '**/*.integration.test.ts']
export default defineWorkspace([
  {
    test: {
      name: 'unit',
      setupFiles: [],
      include: ['**/*.test.ts'],
      exclude: integrationTestFiles,
    },
  },
  {
    test: {
      name: 'integration',
      hookTimeout: 45000,
      setupFiles: ['./test/setupTests.ts'],
      include: integrationTestFiles,
    },
  },
])