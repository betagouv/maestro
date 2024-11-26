import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { Context } from '../../shared/schema/ProgrammingPlan/Context';
exports.up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.enum('context', Context.options);
  });
  await knex('prescriptions')
    .updateFrom('programming_plans')
    .where(
      'prescriptions.programming_plan_id',
      knex.raw('programming_plans.id')
    )
    .update({
      context: knex.raw('programming_plans.kind'),
    });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('context').notNullable().alter();
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropUnique(['programming_plan_id', 'region', 'matrix', 'stages']);
    table.unique([
      'programming_plan_id',
      'region',
      'matrix',
      'stages',
      'context',
    ]);
  });

  await knex.schema.alterTable('samples', (table) => {
    table.enum('context', Context.options);
  });
  await knex('samples')
    .updateFrom('programming_plans')
    .where('samples.programming_plan_id', knex.raw('programming_plans.id'))
    .update({
      context: knex.raw('programming_plans.kind'),
    });
  await knex.schema.alterTable('samples', (table) => {
    table.string('context').notNullable().alter();
  });

  const programmingPlansToRemove = await knex('programming_plans').where(
    'kind',
    'Surveillance'
  );

  await Promise.all(
    programmingPlansToRemove.map(async (programmingPlanToRemove) => {
      const replacingProgrammingPlan = await knex('programming_plans')
        .where('status', programmingPlanToRemove.status)
        .andWhere('kind', 'Control')
        .first();

      if (replacingProgrammingPlan) {
        await knex('prescriptions')
          .where('programming_plan_id', programmingPlanToRemove.id)
          .update({ programming_plan_id: replacingProgrammingPlan.id });
        await knex('samples')
          .where('programming_plan_id', programmingPlanToRemove.id)
          .update({ programming_plan_id: replacingProgrammingPlan.id });
      }

      await knex('programming_plans')
        .where('id', programmingPlanToRemove.id)
        .del();
    })
  );

  await knex.schema.alterTable('programming_plans', (table) => {
    table.integer('year');
  });
  await knex('programming_plans')
    .update({ year: 2024 })
    .where('status', 'Validated');
  await knex('programming_plans')
    .update({ year: 2025 })
    .where('status', 'InProgress');
  await knex.schema.alterTable('programming_plans', (table) => {
    table.integer('year').notNullable().alter();
    table.dropColumns('title', 'kind');
    table.unique(['year']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropUnique(['year']);
    table.string('title');
    table.enum('kind', Context.options).defaultTo('Control');
    table.dropColumns('year');
  });

  const controlProgrammingPlans = await knex('programming_plans').where(
    'kind',
    'Control'
  );

  await Promise.all(
    controlProgrammingPlans.map(async (controlProgrammingPlan) => {
      const surveillanceProgrammingPlan = {
        ...controlProgrammingPlan,
        id: uuidv4(),
        kind: 'Surveillance',
      };
      await knex('programming_plans').insert(surveillanceProgrammingPlan);
      await knex('prescriptions')
        .where('programming_plan_id', controlProgrammingPlan.id)
        .andWhere('context', 'Surveillance')
        .update({ programming_plan_id: surveillanceProgrammingPlan.id });
      await knex('samples')
        .where('programming_plan_id', controlProgrammingPlan.id)
        .andWhere('context', 'Surveillance')
        .update({ programming_plan_id: surveillanceProgrammingPlan.id });
    })
  );

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropUnique([
      'programming_plan_id',
      'region',
      'matrix',
      'stages',
      'context',
    ]);
    table.unique(['programming_plan_id', 'region', 'matrix', 'stages']);
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumns('context');
  });

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumns('context');
  });
};
