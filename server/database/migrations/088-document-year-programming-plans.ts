import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.integer('year');
  });

  await knex.schema.createTable('document_programming_plans', (table) => {
    table
      .uuid('document_id')
      .notNullable()
      .references('id')
      .inTable('documents')
      .onDelete('CASCADE');
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onDelete('CASCADE');
    table.primary(['document_id', 'programming_plan_id']);
  });

  await knex.raw(`
    UPDATE documents d SET
      year = CASE WHEN name ILIKE '%2025%' THEN 2025 ELSE 2026 END
    WHERE d.kind = ANY(ARRAY[
      'ProgrammingPlanNotice',
      'TechnicalInstruction',
      'OtherResourceDocument'
    ])
  `);

  await knex.raw(`
    INSERT INTO document_programming_plans (document_id, programming_plan_id)
    SELECT DISTINCT d.id, pp.id
    FROM documents d
    JOIN programming_plan_kinds ppk ON (
      (d.name ILIKE '%PPV%' AND ppk.kind = 'PPV')
      OR (d.name ILIKE '%DAOA%' AND ppk.kind IN ('DAOA_VOLAILLE', 'DAOA_BOVIN'))
    )
    JOIN programming_plans pp ON pp.id = ppk.programming_plan_id
    WHERE d.kind = ANY(ARRAY[
      'ProgrammingPlanNotice',
      'TechnicalInstruction',
      'OtherResourceDocument'
      ])
  `);
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTableIfExists('document_programming_plans');
  await knex.schema.alterTable('documents', (table) => {
    table.dropColumn('year');
  });
};
