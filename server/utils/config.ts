import convict from 'convict';
import formats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import path from 'path';

convict.addFormats(formats);

if (!process.env.API_PORT) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

interface Config {
  environment: string;
  serverPort: number;
  auth: {
    secret: string;
    expiresIn: string;
  };
  databaseEnvironment: string;
  databaseUrl: string;
  databaseUrlTest: string;
  maxRate: number;
  application: {
    host: string;
  };
}

const config = convict<Config>({
  environment: {
    env: 'NODE_ENV',
    format: String,
    default: 'development',
  },
  serverPort: {
    env: 'API_PORT',
    format: Number,
    default: 3001,
  },
  auth: {
    secret: {
      env: 'AUTH_SECRET',
      format: String,
      sensitive: true,
      default: null,
    },
    expiresIn: {
      env: 'AUTH_EXPIRES_IN',
      format: String,
      default: '12 hours',
    },
  },
  databaseEnvironment: {
    env: 'DATABASE_ENV',
    format: String,
    default: process.env.NODE_ENV ?? 'development',
  },
  databaseUrl: {
    env: 'DATABASE_URL',
    format: String,
    default: null,
  },
  databaseUrlTest: {
    env: 'DATABASE_URL_TEST',
    format: String,
    default: null,
  },
  maxRate: {
    env: 'MAX_RATE',
    format: 'int',
    default: 10000,
  },
  application: {
    host: {
      env: 'APPLICATION_HOST',
      format: 'url',
      default: 'http://localhost:3000',
    },
  },
})
  .validate({ allowed: 'strict' })
  .get();

export default config;
