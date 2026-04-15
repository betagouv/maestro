import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { Client } from 'pg';
import type { ProvidedContext } from 'vitest';
import config from '../utils/config';

declare module 'vitest' {
  export interface ProvidedContext {
    templateDbName: string;
  }
}

const TEMPLATE_DB_NAME = 'maestro_test_template';

export async function setup({
  provide
}: {
  provide: <T extends keyof ProvidedContext & string>(
    key: T,
    value: ProvidedContext[T]
  ) => void;
}): Promise<void> {
  // Pre-create carbone's temp directory to avoid failed tests
  mkdirSync('/tmp/carbone_render', { recursive: true });

  const globalClient = new Client(config.databaseUrl);
  await globalClient.connect();

  await globalClient.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TEMPLATE_DB_NAME}'`
  );
  await globalClient.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB_NAME}"`);
  await globalClient.query(`CREATE DATABASE "${TEMPLATE_DB_NAME}"`);

  const connectionUrl = `postgres://${globalClient.user}:${globalClient.password}@${globalClient.host}:${globalClient.port}/${TEMPLATE_DB_NAME}`;
  await globalClient.end();

  const output = spawnSync(
    'npx',
    [
      'knex',
      'migrate:latest',
      '--migrations-directory',
      'database/migrations',
      '--connection',
      connectionUrl
    ],
    {
      encoding: 'utf-8',
      env: {
        ...process.env,
        PATH: process.env.PATH,
        NODE_OPTIONS: '--import @swc-node/register/esm-register'
      }
    }
  );
  console.log(output.stdout);
  if (output.stderr) console.error(output.stderr);

  provide('templateDbName', TEMPLATE_DB_NAME);
}

export async function teardown(): Promise<void> {
  const globalClient = new Client(config.databaseUrl);
  await globalClient.connect();
  await globalClient.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TEMPLATE_DB_NAME}'`
  );
  await globalClient.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB_NAME}"`);
  await globalClient.end();
}
