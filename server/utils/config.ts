import dotenv from 'dotenv';
import path from 'path';
import { z, ZodType } from 'zod';
import type { NoUndefined } from 'zod/v4/core/util';

if (!process.env.API_PORT) {
  dotenv.config({ path: path.join(import.meta.dirname, '../../.env') });
}
const isProduction = process.env.NODE_ENV === 'production';
const MailProvider = z.enum(['fake', 'brevo', 'nodemailer']);
export type MailProvider = z.infer<typeof MailProvider>;

const devDefaultValue = <T extends ZodType>(
  t: T,
  defaultValue: NoUndefined<z.infer<T>>
) => {
  if (!isProduction) {
    return t.default(defaultValue);
  }

  return t;
};

const coerceBoolean = () =>
  z.enum(['true', 'false']).transform((b) => b === 'true');

const configValidator = z
  .object({
    APPLICATION_HOST: z.url().default('http://localhost:3000'),
    REVIEW_APP: coerceBoolean().default(false),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    VITE_API_URL: z.url().default('http://localhost:3001'),
    API_PORT: z.coerce.number().default(3001),
    AUTH_SECRET: z.string(),
    AUTH_EXPIRES_IN: z.string().default('12 hours'),
    AUTH_CLIENT_ID: z.string().nullish(),
    AUTH_CLIENT_SECRET: z.string().nullish(),
    AUTH_PROVIDER_URL: z.url().nullish(),
    AUTH_TOKEN_ALGORITHM: z.string().default('RS256'),
    AUTH_USER_INFO_ALGORITHM: z.string().nullish(),
    DATABASE_URL: z.string(),
    MAIL_FROM: z.email().default('contact@maestro.beta.gouv.fr'),
    MAILER_PROVIDER: MailProvider.default('fake'),
    MAILER_HOST: z.string().nullish(),
    MAILER_PORT: z.coerce.number().nullish(),
    MAILER_USER: z.string().nullish(),
    MAILER_PASSWORD: z.string().nullish(),
    MAILER_API_KEY: z.string().nullish(),
    MAILER_EVENT_API_KEY: z.string().nullish(),
    MAILER_SECURE: coerceBoolean().default(false),
    MAX_RATE: z.coerce.number().default(10000),
    S3_ENDPOINT: devDefaultValue(z.url(), 'http://localhost:9090'),
    S3_REGION: devDefaultValue(z.string(), 'whatever'),
    S3_ACCESS_KEY_ID: devDefaultValue(z.string(), 'key'),
    S3_SECRET_ACCESS_KEY: devDefaultValue(z.string(), 'secret'),
    S3_BUCKET: z.string().default('maestro'),
    SENTRY_DSN: z.string().nullish(),
    SENTRY_ENABLED: coerceBoolean().default(isProduction),
    ADDRESS_API_URL: z.url().default('https://api-adresse.data.gouv.fr'),
    COMPANY_API_URL: z
      .url()
      .default('https://recherche-entreprises.api.gouv.fr'),
    INBOX_MAILBOX_NAME: z.string().default('Inbox'),
    INBOX_SUCCESSBOX_NAME: z.string().default('Trash'),
    INBOX_ERRORBOX_NAME: z.string().default('Trash'),
    INBOX_HOST: z.string().nullish(),
    INBOX_USER: z.string().nullish(),
    INBOX_PASSWORD: z.string().nullish(),
    INBOX_PORT: z.coerce.number().default(993),
    M2M_BASIC_TOKEN: devDefaultValue(z.string(), 'basicToken'),
    MATTERMOST_INCOMING_WEBHOOK: z.url().nullish(),
    BROWSERLESS_URL: devDefaultValue(
      z.string(),
      'ws://localhost:3002?token=1234512345'
    )
  })
  .transform((c) => {
    return {
      application: {
        host: c.APPLICATION_HOST,
        isReviewApp: c.REVIEW_APP
      },
      environment: c.NODE_ENV,
      serverUrl: c.VITE_API_URL,
      serverPort: c.API_PORT,
      auth: {
        secret: c.AUTH_SECRET,
        expiresIn: c.AUTH_EXPIRES_IN,
        clientId: c.AUTH_CLIENT_ID,
        clientSecret: c.AUTH_CLIENT_SECRET,
        providerUrl: c.AUTH_PROVIDER_URL,
        tokenAlgorithm: c.AUTH_TOKEN_ALGORITHM,
        userInfoAlgorithm: c.AUTH_USER_INFO_ALGORITHM
      },
      databaseUrl: c.DATABASE_URL,
      mail: {
        from: c.MAIL_FROM
      },
      mailer: {
        provider: c.MAILER_PROVIDER,
        host: c.MAILER_HOST,
        port: c.MAILER_PORT,
        user: c.MAILER_USER,
        password: c.MAILER_PASSWORD,
        apiKey: c.MAILER_API_KEY,
        eventApiKey: c.MAILER_EVENT_API_KEY,
        secure: c.MAILER_SECURE
      },
      maxRate: c.MAX_RATE,
      s3: {
        client: {
          endpoint: c.S3_ENDPOINT,
          region: c.S3_REGION,
          credentials: {
            accessKeyId: c.S3_ACCESS_KEY_ID,
            secretAccessKey: c.S3_SECRET_ACCESS_KEY
          }
        },
        bucket: c.S3_BUCKET
      },
      sentry: {
        dsn: c.SENTRY_DSN,
        enabled: c.SENTRY_ENABLED
      },
      apis: {
        address: {
          url: c.ADDRESS_API_URL
        },
        company: {
          url: c.COMPANY_API_URL
        }
      },
      inbox: {
        mailboxName: c.INBOX_MAILBOX_NAME,
        successboxName: c.INBOX_SUCCESSBOX_NAME,
        errorboxName: c.INBOX_ERRORBOX_NAME,
        host: c.INBOX_HOST,
        user: c.INBOX_USER,
        password: c.INBOX_PASSWORD,
        port: c.INBOX_PORT
      },
      browserlessUrl: c.BROWSERLESS_URL,
      mattermostIncomingWebhook: c.MATTERMOST_INCOMING_WEBHOOK,
      m2mBasicToken: c.M2M_BASIC_TOKEN
    };
  });

const config = configValidator.parse(process.env);

export default config;
