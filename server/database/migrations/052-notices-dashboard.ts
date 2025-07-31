import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`insert into notices (type) values ('dashboard')`);
  await knex.raw(`alter table notices
    alter column description type text using description::text;`);
};

export const down = async (knex: Knex) => {
  await knex.raw(`delete notices where type = 'dashboard'`);
};
