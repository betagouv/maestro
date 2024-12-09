import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: [],
    include: ['shared/**/*.test.unit.ts', 'server/**/*.test.unit.ts']
  }
})