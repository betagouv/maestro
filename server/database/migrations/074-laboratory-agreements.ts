import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratory_agreements', (table) => {
    table
      .uuid('laboratory_id')
      .notNullable()
      .references('id')
      .inTable('laboratories')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('substance_kind').notNullable();
    table.primary(['laboratory_id', 'programming_plan_id', 'substance_kind']);
  });

  const PPVProgrammingPlanIds = await knex('programming_plans')
    .select('id')
    .whereRaw('kinds @> ?', [['PPV']]);
  const PPVLaboratoryIds = await knex('laboratories')
    .select('id')
    .whereIn('short_name', [
      'CAP 29',
      'CER 30',
      'GIR 49',
      'LDA 66',
      'LDA 72',
      'SCL 34',
      'SCL 91'
    ]);

  if (PPVProgrammingPlanIds.length && PPVLaboratoryIds.length) {
    await knex('laboratory_agreements').insert(
      PPVProgrammingPlanIds.flatMap(({ id: programmingPlanId }) =>
        PPVLaboratoryIds.map(({ id: laboratoryId }) => ({
          laboratory_id: laboratoryId,
          programming_plan_id: programmingPlanId,
          substance_kind: 'Any'
        }))
      )
    );
  }

  const DAOAProgrammingPlanIds = await knex('programming_plans')
    .select('id')
    .whereRaw('kinds @> ?', [['DAOA_BREEDING', 'DAOA_SLAUGHTER']]);
  const DAOAMonoLaboratoryIds = await knex('laboratories')
    .select('id')
    .whereIn('short_name', ['ANS 94a - LNR PEST']);
  const DAOAMultiLaboratoryIds = await knex('laboratories')
    .select('id')
    .whereIn('short_name', [
      'LDA 17',
      'LDA 21',
      'LDA 22',
      'LDA 31',
      'LDA 72',
      'LDA 85',
      'LDA 87',
      'ANS 94a - LNR PEST'
    ]);
  const DAOACopperLaboratoryIds = await knex('laboratories')
    .select('id')
    .whereIn('short_name', ['LDA 85']);

  if (DAOAProgrammingPlanIds.length && DAOAMonoLaboratoryIds.length) {
    await knex('laboratory_agreements').insert(
      DAOAProgrammingPlanIds.flatMap(({ id: programmingPlanId }) =>
        DAOAMonoLaboratoryIds.map(({ id: laboratoryId }) => ({
          laboratory_id: laboratoryId,
          programming_plan_id: programmingPlanId,
          substance_kind: 'Mono'
        }))
      )
    );
  }
  if (DAOAProgrammingPlanIds.length && DAOAMultiLaboratoryIds.length) {
    await knex('laboratory_agreements').insert(
      DAOAProgrammingPlanIds.flatMap(({ id: programmingPlanId }) =>
        DAOAMultiLaboratoryIds.map(({ id: laboratoryId }) => ({
          laboratory_id: laboratoryId,
          programming_plan_id: programmingPlanId,
          substance_kind: 'Multi'
        }))
      )
    );
  }
  if (DAOAProgrammingPlanIds.length && DAOACopperLaboratoryIds.length) {
    await knex('laboratory_agreements').insert(
      DAOAProgrammingPlanIds.flatMap(({ id: programmingPlanId }) =>
        DAOACopperLaboratoryIds.map(({ id: laboratoryId }) => ({
          laboratory_id: laboratoryId,
          programming_plan_id: programmingPlanId,
          substance_kind: 'Copper'
        }))
      )
    );
  }
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_agreements');
};
