import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.raw(
    'drop index public.prescription_substances_prescription_id_index'
  );
};

export const down = async (knex: Knex) => {
  await knex.raw(
    'create index prescription_substances_prescription_id_index on prescription_substances (prescription_id)'
  );
};
