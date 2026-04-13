import knex, { type Knex } from 'knex';
import { cloneDeep } from 'lodash-es';
import { Client } from 'pg';
import defaultKnexConfig from '../knexfile';
import { setKnexInstance } from '../repositories/db';
import { initKysely, kysely } from '../repositories/kysely';
import config from '../utils/config';

class DbManager {
  private readonly dbName: string;
  private knexInstance: null | Knex = null;
  private connectionUrl: string | null = null;

  public constructor() {
    this.dbName = `maestro_test_${(Math.random() + 1).toString(36).substring(7)}`;
    console.log(`Base de données de test: ${this.dbName}`);
  }

  private async init(templateDbName: string): Promise<void> {
    const globalClient = new Client(config.databaseUrl);
    await globalClient.connect();
    await globalClient.query(
      `CREATE DATABASE "${this.dbName}" TEMPLATE "${templateDbName}"`
    );
    await globalClient.end();

    this.connectionUrl = `postgres://${globalClient.user}:${globalClient.password}@${globalClient.host}:${globalClient.port}/${this.dbName}`;
    this.knexInstance = this.getKnex(this.connectionUrl);
    initKysely(this.connectionUrl);
    setKnexInstance(this.knexInstance!);
  }

  private getKnex(url: string): Knex {
    const options = cloneDeep(defaultKnexConfig);

    return knex({
      ...options,
      connection: url
    });
  }

  private static checkKnexInstance(knex: null | Knex): asserts knex is Knex {
    if (knex === null) {
      throw new Error('populateDb should be called first');
    }
  }

  public async populateDb(templateDbName: string): Promise<{ knex: Knex }> {
    await this.init(templateDbName);

    DbManager.checkKnexInstance(this.knexInstance);

    return { knex: this.knexInstance };
  }

  public async closeDb(): Promise<void> {
    DbManager.checkKnexInstance(this.knexInstance);
    await this.knexInstance.destroy();

    await kysely.destroy();
    await this.end();
  }

  private async end(): Promise<void> {
    const globalClient = new Client(config.databaseUrl);
    await globalClient.connect();
    await globalClient.query(`DROP DATABASE ${this.dbName}`);
    await globalClient.end();
  }

  public async truncateSchema() {
    DbManager.checkKnexInstance(this.knexInstance);
    const tables = await this.knexInstance('pg_tables')
      .select('tablename')
      .where('schemaname', 'public');

    await this.knexInstance.raw(
      `TRUNCATE TABLE "${tables
        .filter((table) => table.tablename !== 'knex_migrations')
        .map((table) => table.tablename)
        .join('","')}"`
    );
  }
}

export const dbManager = new DbManager();
