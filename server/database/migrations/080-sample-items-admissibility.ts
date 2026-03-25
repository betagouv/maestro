import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.text('notes_on_admissibility');
    table.string('receipt_date');
  });

  await knex('sample_items')
    .updateFrom('samples')
    .where('sample_items.sample_id', knex.raw('samples.id'))
    .andWhere('sample_items.item_number', 1)
    .andWhere('sample_items.copy_number', 1)
    .update({
      notes_on_admissibility: knex.ref('samples.notes_on_admissibility'),
      receipt_date: knex.raw("TO_CHAR(samples.received_at, 'YYYY-MM-DD')")
    });

  const notAdmissibleSamples = await knex('samples').where(
    'status',
    'NotAdmissible'
  );

  if (notAdmissibleSamples.length > 0) {
    await knex('analysis').insert(
      notAdmissibleSamples.map((sample) => ({
        sampleId: sample.id,
        itemNumber: 1,
        copyNumber: 1,
        status: 'NotAdmissible'
      }))
    );

    await knex('samples')
      .whereIn(
        'id',
        notAdmissibleSamples.map((sample) => sample.id)
      )
      .update({ status: 'Completed' });
  }

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('notes_on_admissibility');
    table.dropColumn('received_at');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.text('notes_on_admissibility');
    table.specificType('received_at', 'timestamptz');
  });

  await knex('samples')
    .updateFrom('sample_items')
    .where('samples.id', knex.raw('sample_items.sample_id'))
    .andWhere('sample_items.item_number', 1)
    .andWhere('sample_items.copy_number', 1)
    .update({
      notes_on_admissibility: knex.ref('sample_items.notes_on_admissibility'),
      received_at: knex.raw(
        "TO_TIMESTAMP(sample_items.receipt_date, 'YYYY-MM-DD')"
      )
    });

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('notes_on_admissibility');
    table.dropColumn('receipt_date');
  });
};
