import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex('analysis').update({ status: 'Sent' }).where({ status: 'Report' });
  await knex('analysis')
    .update({ status: 'Analysis' })
    .whereIn('status', ['Compliance', 'Residues']);
  await knex('analysis')
    .updateFrom('samples')
    .where('analysis.sample_id', knex.raw('samples.id'))
    .whereIn('samples.status', [
      'NotAdmissible',
      'Analysis',
      'InReview',
      'Completed'
    ])
    .update({
      status: knex.raw('samples.status')
    });

  await knex('samples')
    .update({ status: 'Sent' })
    .whereIn('status', ['NotAdmissible', 'Analysis', 'InReview', 'Completed']);

  await knex.raw('DROP VIEW IF EXISTS sample_status');
  await knex.raw('DROP VIEW IF EXISTS sample_item_status');

  await knex.schema.alterTable('samples', (table) => {
    table.renameColumn('status', 'step');
  });

  const sampleWithoutAnalysis = await knex('samples')
    .select('samples.id', 'sample_items.item_number')
    .join('sample_items', 'samples.id', 'sample_items.sample_id')
    .leftJoin('analysis', (query) =>
      query
        .on('analysis.sample_id', '=', 'sample_items.sample_id')
        .andOn('analysis.item_number', '=', 'sample_items.item_number')
        .andOn('analysis.copy_number', '=', 'sample_items.copy_number')
    )
    .whereNull('analysis.sample_id')
    .andWhere('step', 'Sent')
    .andWhere('sample_items.item_number', '=', 1);

  if (sampleWithoutAnalysis.length > 0) {
    await knex('analysis').insert(
      sampleWithoutAnalysis.map((sample) => ({
        sample_id: sample.id,
        item_number: sample.itemNumber,
        copy_number: 1,
        status: 'Sent'
      }))
    );
  }

  await knex.raw(`
    CREATE VIEW sample_item_status AS
    SELECT
      si.sample_id,
      si.item_number,
      CASE MIN(
        CASE
          WHEN a.status = 'Sent' THEN 1
          WHEN a.status = 'NotAdmissible' THEN 2
          WHEN a.status = 'Analysis' THEN 3
          WHEN a.status = 'InReview' THEN 4
          WHEN a.status = 'Completed' THEN 5
          ELSE NULL
        END
      )
        WHEN 1 THEN 'Sent'
        WHEN 2 THEN 'NotAdmissible'
        WHEN 3 THEN 'Analysis'
        WHEN 4 THEN 'InReview'
        WHEN 5 THEN 'Completed'
        ELSE 'Sent'
      END as status
    FROM sample_items si
    LEFT JOIN analysis a
      ON a.sample_id = si.sample_id
      AND a.item_number = si.item_number
      AND a.copy_number = si.copy_number
    GROUP BY si.sample_id, si.item_number
  `);

  await knex.raw(`
    CREATE VIEW sample_status AS
    SELECT
      s.id as sample_id,
      CASE
        WHEN s.step = 'Draft' THEN 'Draft'
        WHEN s.step = 'DraftMatrix' THEN 'Draft'
        WHEN s.step = 'DraftItems' THEN 'Draft'
        WHEN s.step = 'Submitted' THEN 'Submitted'
        WHEN (
          SELECT COUNT(*) FROM sample_item_status sis WHERE sis.sample_id = s.id
        ) > 0
        AND (
          SELECT COUNT(*) FROM sample_item_status sis WHERE sis.sample_id = s.id AND sis.status != 'NotAdmissible'
        ) = 0
          THEN 'NotAdmissible'
        ELSE 
          (
            SELECT CASE MIN(
              CASE
                WHEN sis.status = 'Sent' THEN 1
                WHEN sis.status = 'NotAdmissible' THEN 2
                WHEN sis.status = 'Analysis' THEN 3
                WHEN sis.status = 'InReview' THEN 4
                WHEN sis.status = 'Completed' THEN 5
                ELSE NULL
              END
            )
              WHEN 1 THEN 'Sent'
              WHEN 2 THEN 'NotAdmissible'
              WHEN 3 THEN 'Analysis'
              WHEN 4 THEN 'InReview'
              WHEN 5 THEN 'Completed'
              ELSE 'Sent'
            END
            FROM sample_item_status sis
            WHERE sis.sample_id = s.id
          )
      END as status
    FROM samples s
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW IF EXISTS sample_status');
  await knex.raw('DROP VIEW IF EXISTS sample_item_status');
  await knex.schema.alterTable('samples', (table) => {
    table.renameColumn('step', 'status');
  });
};
