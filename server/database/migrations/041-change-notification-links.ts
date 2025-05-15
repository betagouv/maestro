import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    update notifications 
        set link = regexp_replace(link, '^/prescriptions/', '/programmation/')
        where link LIKE '/prescriptions/%';
  `);

  await knex.raw(`
    update notifications
        set link = regexp_replace(link, '^(/prelevements)/\\d{4}/', '\\1/')
        where link ~ '^/prelevements/\\d{4}/';
  `);
};

export const down = async () => {};
