import { Knex } from 'knex';
import { RegionList } from 'maestro-shared/referential/Region';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sample_sequence_numbers', (table) => {
    table.primary(['region', 'programming_plan_year']);
    table.enum('region', RegionList).notNullable();
    table.integer('programming_plan_year').notNullable();
    table.integer('next_sequence').notNullable().defaultTo(1);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('sample_sequence_numbers');
};
