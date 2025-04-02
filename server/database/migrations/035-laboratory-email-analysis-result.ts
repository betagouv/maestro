import { Knex } from 'knex';
export const up = async (knex: Knex) => {


  await knex.schema.alterTable('laboratories', (table) => {
    table.string('email_analysis_result').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('email_analysis_result');
  });

};
