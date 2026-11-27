import type { Knex } from 'knex';
import { Regions } from 'maestro-shared/referential/Region.ts';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('dap_number').nullable().unique();
  });

  await knex.raw(
    `UPDATE samples
     set dap_number = concat('9600', substring(reference FROM 5 FOR 2), lpad(substring(reference FROM 8), 6, '0'))
     where sent_at > TIMESTAMP '2026-10-27 10:06:00.000 +0100'
       and sent_at is not null`
  );

  const samples: { reference: string }[] = await knex
    .select('reference')
    .from('samples')
    .whereRaw("sent_at <= TIMESTAMP '2026-10-27 10:06:00.000 +0100'")
    .whereRaw("sent_at >= TIMESTAMP '2026-01-01 00:00:00.000 +0000'")
    .where('sent_at', 'is not', null);

  for (const sample of samples) {
    const [regionShortName, _year, index] = sample.reference.split('-');
    const regionId = Object.entries(Regions).find(([_id, { shortName }]) => {
      return shortName === regionShortName;
    })?.[0];
    await knex.raw('UPDATE samples set dap_number = ? where reference = ?', [
      `2026${regionId}${index.padStart(6, '0')}`,
      sample.reference
    ]);
  }

  const samplesWithoutDap: { reference: string }[] = await knex
    .select('reference')
    .from('samples')
    .where('dap_number', 'is', null);
  for (let index = 0; index < samplesWithoutDap.length; index++) {
    const sample = samplesWithoutDap[index];

    await knex.raw(
      `UPDATE samples
     set dap_number = concat('960025', lpad(?::varchar, 6, '0'))
     where reference = ?`,
      [index, sample.reference]
    );
  }

  await knex.raw('ALTER TABLE samples ALTER COLUMN dap_number SET NOT NULL');
};

export const down = async (_knex: Knex) => {};
