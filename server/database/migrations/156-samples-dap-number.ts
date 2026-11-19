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
};
//FIXME ajouter le numéro DAP lors de l'envoi de la DAI
//FIXME lors de la réception de la RAI, faire un where avec le numéro du DAP
//FIXME normalement on doit avoir des acquittements avec les RAI de tests

export const down = async (_knex: Knex) => {};
