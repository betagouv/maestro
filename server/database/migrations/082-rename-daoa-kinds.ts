import { Knex } from 'knex';

const renameMap = {
  DAOA_BREEDING: 'DAOA_VOLAILLE',
  DAOA_SLAUGHTER: 'DAOA_BOVIN'
} as const;

const reverseMap = Object.fromEntries(
  Object.entries(renameMap).map(([k, v]) => [v, k])
);

export const up = async (knex: Knex) => {
  for (const [oldKind, newKind] of Object.entries(renameMap)) {
    await knex('programming_plan_kinds')
      .where('kind', oldKind)
      .update({ kind: newKind });

    await knex.raw(
      `UPDATE users SET programming_plan_kinds = array_replace(programming_plan_kinds, ?, ?)`,
      [oldKind, newKind]
    );

    await knex.raw(
      `UPDATE samples SET specific_data = jsonb_set(specific_data::jsonb, '{programmingPlanKind}', ?::jsonb)::json WHERE specific_data->>'programmingPlanKind' = ?`,
      [JSON.stringify(newKind), oldKind]
    );
  }
};

export const down = async (knex: Knex) => {
  for (const [newKind, oldKind] of Object.entries(reverseMap)) {
    await knex('programming_plan_kinds')
      .where('kind', newKind)
      .update({ kind: oldKind });

    await knex.raw(
      `UPDATE users SET programming_plan_kinds = array_replace(programming_plan_kinds, ?, ?)`,
      [newKind, oldKind]
    );

    await knex.raw(
      `UPDATE samples SET specific_data = jsonb_set(specific_data::jsonb, '{programmingPlanKind}', ?::jsonb)::json WHERE specific_data->>'programmingPlanKind' = ?`,
      [JSON.stringify(oldKind), newKind]
    );
  }
};
