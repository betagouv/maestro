import type { Knex } from 'knex';

const subPlanConstraints = [
  {
    table: 'laboratory_agreements',
    name: 'laboratory_agreements_programming_sub_plan_id_foreign'
  },
  {
    table: 'laboratory_agreement_checks',
    name: 'laboratory_agreement_checks_programming_sub_plan_id_foreign'
  },
  {
    table: 'programming_sub_plan_fields_raw',
    name: 'programming_plan_kind_fields_programming_sub_plan_id_foreign'
  }
];

const setOnDelete = async (knex: Knex, onDelete: string) => {
  for (const { table, name } of subPlanConstraints) {
    await knex.raw(`
      ALTER TABLE ${table}
        DROP CONSTRAINT ${name},
        ADD CONSTRAINT ${name}
          FOREIGN KEY (programming_sub_plan_id)
          REFERENCES programming_sub_plans_raw (id)
          ON DELETE ${onDelete}
    `);
  }

  await knex.raw(`
    ALTER TABLE programming_plans
      DROP CONSTRAINT programming_plans_domain_id_year_foreign,
      ADD CONSTRAINT programming_plans_domain_id_year_foreign
        FOREIGN KEY (domain_id, year)
        REFERENCES programming_plan_domains (id, year)
        ON UPDATE CASCADE
        ON DELETE ${onDelete}
  `);
};

export const up = async (knex: Knex) => setOnDelete(knex, 'CASCADE');

export const down = async (knex: Knex) => setOnDelete(knex, 'NO ACTION');
