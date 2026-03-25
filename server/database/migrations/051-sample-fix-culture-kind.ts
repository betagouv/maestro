import type { Knex } from 'knex';
import {
  RealizedStatusList,
  type SampleStatus
} from 'maestro-shared/schema/Sample/SampleStatus';

export const up = async (knex: Knex) => {
  const result: {
    rows: {
      id: string;
      status: SampleStatus;
      specific_data: any;
    }[];
  } = await knex.raw('select * from samples');

  const samplesToFix = result.rows.filter((r) => {
    return (
      RealizedStatusList.includes(r.status) &&
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
