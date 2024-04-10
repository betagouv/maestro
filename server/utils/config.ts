import convict from 'convict';
import formats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import path from 'path';

convict.addFormats(formats);

if (!process.env.API_PORT) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}
export const isProduction = process.env.NODE_ENV === 'production';

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
  s3: {
    client: {
      endpoint: string;
      region: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
      };
    };
    bucket: string;
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
  s3: {
    client: {
      endpoint: {
        env: 'S3_ENDPOINT',
        format: 'url',
        default: isProduction ? null : 'http://localhost:9090',
      },
      region: {
        env: 'S3_REGION',
        format: String,
        default: isProduction ? null : 'whatever',
      },
      credentials: {
        accessKeyId: {
          env: 'S3_ACCESS_KEY_ID',
          format: String,
          default: isProduction ? null : 'key',
        },
        secretAccessKey: {
          env: 'S3_SECRET_ACCESS_KEY',
          format: String,
          default: isProduction ? null : 'secret',
        },
      },
    },
    bucket: {
      env: 'S3_BUCKET',
      format: String,
      default: 'pspc',
    },
  },
})
  .validate({ allowed: 'strict' })
  .get();

export default config;
