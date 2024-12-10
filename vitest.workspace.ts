import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      setupFiles: [],
      include: ['shared/**/*.test.unit.ts', 'server/**/*.test.unit.ts']
    },
  },
  {
    test: {
      name: 'integration',
      testTimeout: 10000,
      hookTimeout: 45000,
      root: 'server',
      setupFiles: [],
      // setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
      globalSetup: './server/test/globalSetup.ts',
      include: ['**/*.test.ts'],
    },
  },
])