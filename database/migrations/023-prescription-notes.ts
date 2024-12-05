import { Knex } from 'knex';
exports.up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('notes');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('notes');
  });
};
