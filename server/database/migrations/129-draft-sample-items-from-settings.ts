import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    INSERT INTO sample_items (
      sample_id,
      item_number,
      copy_number,
      recipient_kind,
      substance_kinds,
      compliance200263,
      laboratory_id
    )
    SELECT
      draft.id,
      sample_item.position,
      sample_copy.copy_position,
      recipient.kind,
      substance.kinds,
      CASE WHEN sub_plan.sub_plan_number = 'PPV' THEN NULL ELSE true END,
      CASE
        WHEN recipient.kind = 'Laboratory'
          AND draft.context IN ('Control', 'Surveillance', 'Exploratory')
        THEN (
          SELECT CASE
            WHEN count(laboratory.laboratory_id) = cardinality(substance.kinds)
              AND count(DISTINCT laboratory.laboratory_id) = 1
            THEN (array_agg(laboratory.laboratory_id))[1]
          END
          FROM local_prescription_substance_kinds_laboratories laboratory
          WHERE laboratory.prescription_id = draft.prescription_id
            AND laboratory.region = draft.region
            AND laboratory.department = CASE
              WHEN plan.distribution_kind = 'SLAUGHTERHOUSE' THEN draft.department
              ELSE 'None'
            END
            AND laboratory.substance_kind = ANY(substance.kinds)
        )
      END
    FROM samples draft
    JOIN programming_sub_plans sub_plan ON sub_plan.id = draft.programming_sub_plan_id
    JOIN programming_plans plan ON plan.id = sub_plan.programming_plan_id
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(sub_plan.samples) = 'array' THEN sub_plan.samples ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS sample_item(sample, position)
    CROSS JOIN LATERAL jsonb_array_elements(sample_item.sample->'copies') WITH ORDINALITY AS sample_copy(copy, copy_position)
    CROSS JOIN LATERAL (
      SELECT CASE
        WHEN jsonb_array_length(sample_copy.copy->'recipientKinds') = 1
        THEN sample_copy.copy->'recipientKinds'->>0
      END AS kind
    ) recipient
    CROSS JOIN LATERAL (
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(sample_item.sample->'substanceKinds')
      ) AS kinds
    ) substance
    WHERE draft.step = 'DraftItems'
      AND NOT EXISTS (
        SELECT 1 FROM sample_items existing WHERE existing.sample_id = draft.id
      )
      AND (sample_copy.copy->>'required')::boolean
      AND cardinality(substance.kinds) > 0
  `);
};

export const down = async () => {};
