import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_domains', (table) => {
    table.integer('year').nullable();
  });

  await knex.raw(`
    INSERT INTO programming_plan_domains (label, year)
    SELECT DISTINCT d.label, p.year
    FROM programming_plans p
    JOIN programming_plan_domains d ON d.id = p.domain_id
  `);

  await knex.raw(`
    UPDATE programming_plans p
    SET domain_id = target.id
    FROM programming_plan_domains d, programming_plan_domains target
    WHERE p.domain_id = d.id
      AND target.label = d.label
      AND target.year = p.year
  `);

  await knex.raw(`
    DELETE FROM programming_plan_domains WHERE year IS NULL
  `);

  await knex.schema.alterTable('programming_plan_domains', (table) => {
    table.integer('year').notNullable().alter();
  });

  await knex.raw(`
    ALTER TABLE programming_plan_domains
    ADD CONSTRAINT programming_plan_domains_id_year_unique UNIQUE (id, year)
  `);

  await knex.raw(`
    ALTER TABLE programming_plans
    DROP CONSTRAINT programming_plans_domain_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE programming_plans
    ADD CONSTRAINT programming_plans_domain_id_year_foreign
    FOREIGN KEY (domain_id, year)
    REFERENCES programming_plan_domains (id, year)
    ON UPDATE CASCADE
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
    ALTER TABLE programming_plans
    DROP CONSTRAINT programming_plans_domain_id_year_foreign
  `);

  await knex.raw(`
    ALTER TABLE programming_plan_domains
    DROP CONSTRAINT programming_plan_domains_id_year_unique
  `);

  await knex.raw(`
    UPDATE programming_plans p
    SET domain_id = kept.id
    FROM programming_plan_domains d
    JOIN (
      SELECT DISTINCT ON (label) label, id
      FROM programming_plan_domains
      ORDER BY label, year
    ) kept ON kept.label = d.label
    WHERE p.domain_id = d.id AND p.domain_id <> kept.id
  `);

  await knex.raw(`
    DELETE FROM programming_plan_domains
    WHERE id NOT IN (
      SELECT DISTINCT ON (label) id
      FROM programming_plan_domains
      ORDER BY label, year
    )
  `);

  await knex.raw(`
    ALTER TABLE programming_plans
    ADD CONSTRAINT programming_plans_domain_id_foreign
    FOREIGN KEY (domain_id)
    REFERENCES programming_plan_domains (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
  `);

  await knex.schema.alterTable('programming_plan_domains', (table) => {
    table.dropColumn('year');
  });
};
