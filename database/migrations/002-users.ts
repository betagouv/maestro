import { Knex } from 'knex';
import { RegionList } from '../../shared/schema/Region';
import { UserRoleList } from '../../shared/schema/User/UserRole';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.enum('role', UserRoleList).notNullable();
    table.enum('region', RegionList);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('users');
};
