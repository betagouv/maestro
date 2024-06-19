import { Knex } from 'knex';
import { RegionList } from '../../shared/referential/Region';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.specificType('roles', 'text[]').notNullable();
    table.enum('region', RegionList);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('users');
};
