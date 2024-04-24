import { Knex } from 'knex';
import { RegionList } from '../../shared/schema/Region';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('regional_programming_plans', (table) => {
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.enum('region', RegionList).notNullable();
    table.uuid('laboratory_id').references('id').inTable('laboratories');
    table.string('status').notNullable();

    table.primary(['programming_plan_id', 'region']);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('regional_programming_plans');
};
