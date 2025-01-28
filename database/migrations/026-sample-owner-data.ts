import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('owner_first_name');
    table.string('owner_last_name');
    table.string('owner_email');
    table.boolean('owner_agreement');
    table.text('notes_on_owner_agreement');
  });

  const samples = await knex('samples').select();

  await Promise.all(
    samples.map(async (sample) => {
      const sampleItem = await knex('sample_items')
        .where('sample_id', sample.id)
        .andWhere((builder) => {
          builder
            .whereNotNull('owner_first_name')
            .orWhereNotNull('owner_last_name')
            .orWhereNotNull('owner_email');
        })
        .orderBy('item_number')
        .first();

      if (sampleItem) {
        await knex('samples').where('id', sample.id).update({
          owner_first_name: sampleItem.ownerFirstName,
          owner_last_name: sampleItem.ownerLastName,
          owner_email: sampleItem.ownerEmail,
          owner_agreement: true
        });
      }
    })
  );

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('owner_first_name');
    table.dropColumn('owner_last_name');
    table.dropColumn('owner_email');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.string('owner_first_name');
    table.string('owner_last_name');
    table.string('owner_email');
  });

  const samples = await knex('samples').select();

  await Promise.all(
    samples.map(async (sample) => {
      if (sample.ownerFirstName || sample.ownerLastName || sample.ownerEmail) {
        await knex('sample_items').where('sample_id', sample.id).update({
          owner_first_name: sample.ownerFirstName,
          owner_last_name: sample.ownerLastName,
          owner_email: sample.ownerEmail
        });
      }
    })
  );

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('owner_first_name');
    table.dropColumn('owner_last_name');
    table.dropColumn('owner_email');
    table.dropColumn('owner_agreement');
    table.dropColumn('notes_on_owner_agreement');
  });
};
