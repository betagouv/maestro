module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './server',
  roots: [],
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  globalSetup: '<rootDir>/test/globalSetup.ts',
};
