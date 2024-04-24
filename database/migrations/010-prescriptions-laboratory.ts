import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('laboratory_id');
  });
};
