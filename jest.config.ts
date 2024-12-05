import type {Config} from 'jest';
import testUnitConfig from './jest-unit.config'

const config: Config = {
 ...testUnitConfig,
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  globalSetup: '<rootDir>/test/globalSetup.ts',
  globalTeardown: '<rootDir>/test/globalTeardown.ts',
  testMatch: ['**/**/*.test.ts'],
};

export default config;
