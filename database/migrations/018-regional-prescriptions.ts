import { Knex } from 'knex';
import { Context } from '../../shared/schema/ProgrammingPlan/Context';

exports.up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropPrimary();
  });
  await knex.schema.renameTable('prescriptions', 'regional_prescriptions');

  await knex.schema.createTable('prescriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
    table.enum('context', Context.options);
    table.string('matrix');
    table.specificType('stages', 'text[]');
  });
  await knex.table('prescriptions').insert(
    knex
      .table('regional_prescriptions')
      .select([
        knex.raw('uuid_generate_v4()'),
        'programming_plan_id',
        'context',
        'matrix',
        'stages'
      ])
      .groupBy(['programming_plan_id', 'context', 'matrix', 'stages'])
  );
  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table
      .uuid('prescription_id')
      .references('id')
      .inTable('prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
  await knex('regional_prescriptions')
    .updateFrom('prescriptions')
    .where(
      'regional_prescriptions.programming_plan_id',
      knex.ref('prescriptions.programming_plan_id')
    )
    .where('regional_prescriptions.context', knex.ref('prescriptions.context'))
    .where('regional_prescriptions.matrix', knex.ref('prescriptions.matrix'))
    .where('regional_prescriptions.stages', knex.ref('prescriptions.stages'))
    .update({
      prescription_id: knex.ref('prescriptions.id')
    });
  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropColumn('id');
    table.dropColumn('programming_plan_id');
    table.dropColumn('context');
    table.dropColumn('matrix');
    table.dropColumn('stages');
    table.uuid('prescription_id').notNullable().alter();
    table.primary(['prescription_id', 'region'], {
      constraintName: 'regional_prescriptions_pkey'
    });
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
    table.enum('context', Context.options);
    table.string('matrix');
    table.specificType('stages', 'text[]');
  });
  await knex('regional_prescriptions')
    .updateFrom('prescriptions')
    .where('prescriptions.id', knex.ref('prescription_id'))
    .update({
      programming_plan_id: knex.ref('prescriptions.programming_plan_id'),
      context: knex.ref('prescriptions.context'),
      matrix: knex.ref('prescriptions.matrix'),
      stages: knex.ref('prescriptions.stages')
    });
  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropColumn('prescription_id');
  });
  await knex.schema.dropTable('prescriptions');
  await knex.schema.renameTable('regional_prescriptions', 'prescriptions');
  await knex.schema.alterTable('prescriptions', (table) => {
    table
      .uuid('id')
      .primary({ constraintName: 'prescriptions_pkey' })
      .defaultTo(knex.raw('uuid_generate_v4()'));
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.unique([
      'programming_plan_id',
      'region',
      'matrix',
      'stages',
      'context'
    ]);
  });
};
