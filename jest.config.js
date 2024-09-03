module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './server',
  roots: ['../shared/schema'],
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  globalSetup: '<rootDir>/test/globalSetup.ts',
};
