import type { Knex } from 'knex';

import type { SampleStep } from 'maestro-shared/schema/Sample/SampleStep';

export const up = async (knex: Knex) => {
  const result: {
    rows: {
      id: string;
      step: SampleStep;
      specific_data: any;
    }[];
  } = await knex.raw('select * from samples');

  const samplesToFix = result.rows.filter((r) => {
    return (
      r.step === 'Sent' &&
      r.specific_data &&
      r.specific_data.programmingPlanKind === 'PPV' &&
      !r.specific_data.cultureKind
    );
  });

  for (const sample of samplesToFix) {
    await knex.raw(
      `
          update samples
          set specific_data = ?
          where id = ?
      `,
      [{ ...sample.specific_data, cultureKind: 'Z0215' }, sample.id]
    );
  }
};

export const down = async (_knex: Knex) => {};
