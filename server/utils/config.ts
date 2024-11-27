import convict from 'convict';
import formats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { Knex } from 'knex';

convict.addFormats(formats);

convict.addFormat({
  name: 'strict-boolean',
  validate(val: any) {
    return typeof val === 'string' && val === 'true';
  },
  coerce: (val: string): boolean => val === 'true',
});

if (!process.env.API_PORT) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}
export const isProduction = process.env.NODE_ENV === 'production';

const MailProvider = z.enum(['brevo', 'nodemailer']);
type MailProvider = z.infer<typeof MailProvider>;

convict.addFormat({
  name: 'mail-provider',
  validate(val: any) {
    return MailProvider.options.includes(val);
  },
});

type DatabaseConnection =  Required<Pick<Knex.PgConnectionConfig, 'user' | 'password' | 'database' | 'host' | 'port'>>;

interface Config {
  application: {
    host: string;
  };
  environment: string;
  serverPort: number;
  auth: {
    secret: string;
    expiresIn: string;
  };
  databaseEnvironment: string;
  database: DatabaseConnection;
  databaseTest: DatabaseConnection;
  mail: {
    from: string;
  };
  mailer: {
    provider: MailProvider;
    host: string | null;
    port: number | null;
    user: string | null;
    password: string | null;
    apiKey: string | null;
    eventApiKey: string | null;
    secure: boolean;
  };
  maxRate: number;
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
  sentry: {
    dsn: string | null;
    enabled: boolean;
  };
  apis: {
    address: {
      url: string;
    };
    company: {
      url: string;
    };
  };
}

const config = convict<Config>({
  application: {
    host: {
      env: 'APPLICATION_HOST',
      format: 'url',
      default: 'http://localhost:3000',
    },
  },
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
  database: {
    host: {
      env: 'DATABASE_HOST',
      format: String,
      nullable: false,
      default: null,
    },
    port: {
      env: 'DATABASE_PORT',
      format: 'port',
      nullable: false,
      default: null,
    },
    user: {
      env: 'DATABASE_USER',
      format: String,
      nullable: false,
      default: null,
    },
    password: {
      env: 'DATABASE_PASSWORD',
      format: String,
      nullable: false,
      default: null,
    },
    database: {
      env: 'DATABASE_NAME',
      format: String,
      nullable: false,
      default: null,
    }

  },
  databaseTest: {
    host: {
      env: 'DATABASE_TEST_HOST',
      format: String,
      nullable: false,
      default: null,
    },
    port: {
      env: 'DATABASE_TEST_PORT',
      format: 'port',
      nullable: false,
      default: null,
    },
    user: {
      env: 'DATABASE_TEST_USER',
      format: String,
      nullable: false,
      default: null,
    },
    password: {
      env: 'DATABASE_TEST_PASSWORD',
      format: String,
      nullable: false,
      default: null,
    },
    database: {
      env: 'DATABASE_TEST_NAME',
      format: String,
      nullable: false,
      default: null,
    }


  },
  mail: {
    from: {
      env: 'MAIL_FROM',
      format: String,
      default: 'contact@maestro.beta.gouv.fr',
    },
  },
  mailer: {
    provider: {
      env: 'MAILER_PROVIDER',
      format: 'mail-provider',
      default: 'nodemailer',
    },
    host: {
      env: 'MAILER_HOST',
      format: String,
      default: null,
      nullable: true,
    },
    port: {
      env: 'MAILER_PORT',
      format: 'port',
      default: null,
      nullable: true,
    },
    user: {
      env: 'MAILER_USER',
      format: String,
      default: null,
      nullable: true,
    },
    password: {
      env: 'MAILER_PASSWORD',
      format: String,
      sensitive: true,
      default: null,
      nullable: true,
    },
    apiKey: {
      env: 'MAILER_API_KEY',
      format: String,
      sensitive: true,
      default: null,
      nullable: true,
    },
    eventApiKey: {
      env: 'MAILER_EVENT_API_KEY',
      format: String,
      sensitive: true,
      default: null,
      nullable: true,
    },
    secure: {
      env: 'MAILER_SECURE',
      format: Boolean,
      default: false,
    },
  },
  maxRate: {
    env: 'MAX_RATE',
    format: 'int',
    default: 10000,
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
      default: 'maestro',
    },
  },
  sentry: {
    dsn: {
      env: 'SENTRY_DSN',
      format: String,
      default: null,
      nullable: true,
    },
    enabled: {
      env: 'SENTRY_ENABLED',
      format: 'strict-boolean',
      default: process.env.NODE_ENV === 'production',
    },
  },
  apis: {
    address: {
      url: {
        env: 'ADDRESS_API_URL',
        format: 'url',
        default: 'https://api-adresse.data.gouv.fr',
      },
    },
    company: {
      url: {
        env: 'COMPANY_API_URL',
        format: 'url',
        default: 'https://recherche-entreprises.api.gouv.fr',
      },
    },
  },
})
  .validate({ allowed: 'strict' })
  .get();

export default config;
