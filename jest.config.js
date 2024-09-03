module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './server',
  roots: ['<rootDir>', '../shared'],
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  globalSetup: '<rootDir>/test/globalSetup.ts',
  globalTeardown: '<rootDir>/test/globalTeardown.ts',
};
