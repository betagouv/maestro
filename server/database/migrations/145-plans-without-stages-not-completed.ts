import type { Knex } from 'knex';

const setSettingsCompleted = async (knex: Knex, settingsCompleted: boolean) => {
  await knex.raw(
    `
    UPDATE programming_plans
    SET settings_completed = :settingsCompleted
    WHERE stages_managed
      AND coalesce(cardinality(stages), 0) = 0
      AND settings_completed = NOT :settingsCompleted
  `,
    { settingsCompleted }
  );

  await knex.raw(
    `
    UPDATE programming_sub_plans_raw
    SET settings_completed = :settingsCompleted
    WHERE id IN (
      SELECT id FROM programming_sub_plans
      WHERE coalesce(cardinality(stages), 0) = 0
    )
      AND settings_completed = NOT :settingsCompleted
  `,
    { settingsCompleted }
  );
};

export const up = (knex: Knex) => setSettingsCompleted(knex, false);

export const down = (knex: Knex) => setSettingsCompleted(knex, true);
