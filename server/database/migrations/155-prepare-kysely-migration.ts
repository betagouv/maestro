import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`CREATE TABLE public.kysely_migration (
	"name" varchar(255) NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT kysely_migration_name_not_null NOT NULL name,
	CONSTRAINT kysely_migration_pkey PRIMARY KEY (name),
	CONSTRAINT kysely_migration_timestamp_not_null NOT NULL "timestamp"
);`);
  await knex.raw(
    'INSERT INTO public.kysely_migration ("name", "timestamp") VALUES(\'001-initdb\', \'2026-11-25T16:20:42.527Z\')'
  );
  await knex.raw(`CREATE TABLE public.kysely_migration_lock (
	id varchar(255) NOT NULL,
	is_locked int4 DEFAULT 0 NOT NULL,
	CONSTRAINT kysely_migration_lock_id_not_null NOT NULL id,
	CONSTRAINT kysely_migration_lock_is_locked_not_null NOT NULL is_locked,
	CONSTRAINT kysely_migration_lock_pkey PRIMARY KEY (id)
);`);
};
export const down = async (_knex: Knex) => {};

// UNE FOIS CECI en prod mettre cette méthode dans kysely.ts et appeler le migrateToLatest dans l'index.ts du server:
//
// export const migrateToLatest = async (
//   kyselyConfigured: NewKyselyMaestro
// ): Promise<void> => {
//   const migrator = new Migrator({
//     db: kyselyConfigured,
//     provider: new FileMigrationProvider({
//       fs,
//       path: { join },
//       // This needs to be an absolute path.
//       migrationFolder: join(import.meta.dirname, '../database')
//     })
//   });
//
//   console.info('db migration starting...');
//   const { error, results } = await migrator.migrateToLatest();
//
//   results?.forEach((it) => {
//     if (it.status === 'Success') {
//       console.info(`migration "${it.migrationName}" was executed successfully`);
//     } else if (it.status === 'Error') {
//       console.error(`failed to execute migration "${it.migrationName}"`);
//     }
//   });
//
//   if (error !== null && error !== undefined) {
//     console.error('failed to migrate');
//     console.error(error);
//     process.exit(1);
//   }
//   console.info('db migration finished');
// };
//
