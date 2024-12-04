import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './server',
  roots: ['<rootDir>', '../shared'],
  setupFiles: [],
  testMatch: ['**/**/*.test.unit.ts'],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes:[
            //  value never read
            6133,
            // declared but never used
            6196
          ]
        },
      },
    ],
  },
};

export default config;
