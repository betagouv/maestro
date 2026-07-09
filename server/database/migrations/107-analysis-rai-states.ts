import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_rai
      drop constraint analysis_rai_state_check;
      update analysis_rai set state = 'INTERNAL_ERROR' where state = 'ERROR';
      alter table analysis_rai
          add constraint analysis_rai_state_check
              check (state = ANY (ARRAY['PROCESSED'::text, 'INTERNAL_ERROR'::text, 'REJECTED'::text]));
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_rai
      drop constraint analysis_rai_state_check;
      
           update analysis_rai set state = 'ERROR' where state in ('INTERNAL_ERROR', 'REJECTED');

      alter table analysis_rai
          add constraint analysis_rai_state_check
              check (state = ANY (ARRAY['PROCESSED'::text, 'ERROR'::text]));
  `);
};
