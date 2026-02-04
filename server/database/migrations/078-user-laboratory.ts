import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table
      .uuid('laboratory_id')
      .nullable()
      .references('id')
      .inTable('laboratories');
  });

  const laboratories = await knex('laboratories').select();

  const ansesPestLab = laboratories.find(
    (lab) => lab.shortName === 'ANS 94a - LNR PEST'
  );
  if (ansesPestLab) {
    await knex('users')
      .whereILike('users.email', '%@anses.fr')
      .update({ laboratory_id: ansesPestLab.id });
  }

  const lda31Lab = laboratories.find((lab) => lab.shortName === 'LDA 31');
  if (lda31Lab) {
    await knex('users')
      .whereILike('users.email', '%@cd31.fr')
      .update({ laboratory_id: lda31Lab.id });
  }

  const lda87Lab = laboratories.find((lab) => lab.shortName === 'LDA 87');
  if (lda87Lab) {
    await knex('users')
      .whereILike('users.email', '%@haute-vienne.fr')
      .update({ laboratory_id: lda87Lab.id });
  }

  const lda85Lab = laboratories.find((lab) => lab.shortName === 'LDA 85');
  if (lda85Lab) {
    await knex('users')
      .whereILike('users.email', '%@vendee.fr')
      .update({ laboratory_id: lda85Lab.id });

    await knex('users')
      .whereILike('users.email', '%@alsace.eu')
      .update({ laboratory_id: lda85Lab.id });
  }
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('laboratory_id');
  });
};
