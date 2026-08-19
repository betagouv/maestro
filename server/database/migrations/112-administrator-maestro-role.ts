import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(
    `update users set roles = array_replace(roles, 'Administrator', 'AdministratorMaestro')`
  );
};

export const down = async (knex: Knex) => {
  await knex.raw(
    `update users set roles = array_replace(roles, 'AdministratorBGIR', 'AdministratorMaestro')`
  );
  await knex.raw(
    `update users set roles = array_replace(roles, 'AdministratorMaestro', 'Administrator')`
  );
};
