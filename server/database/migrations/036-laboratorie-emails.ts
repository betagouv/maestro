import { Knex } from 'knex';
export const up = async (knex: Knex) => {

  await knex.raw(`alter table public.laboratories add emails varchar(255)[] default '{}' not null;`)
  await knex.raw(`alter table public.laboratories add emails_analysis_result varchar(255)[] default '{}' not null;`)

  await knex('laboratories').update({ emails: knex.raw(`ARRAY[email]`)});
  await knex('laboratories').update({ emails_analysis_result: knex.raw(`ARRAY[email_analysis_result]`)});

  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('email');
    table.dropColumn('email_analysis_result');
  })
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.string('email');
    table.string('email_analysis_result');
  });

  await knex('laboratories').update({ email: knex.raw(`emails[1]`) });
  await knex('laboratories').update({ email_analysis_result: knex.raw(`email_analysis_result[1]`) });

  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('emails');
    table.dropColumn('emails_analysis_result');
    table.string('email').notNullable().alter();
  })
};
