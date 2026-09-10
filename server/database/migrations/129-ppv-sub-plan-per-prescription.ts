import type { Knex } from 'knex';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { v4 as uuidv4 } from 'uuid';

const PPVPrefix = 'PPV';

type PrescriptionRow = {
  id: string;
  matrixKind: string | null;
  matrix: string | null;
  context: string | null;
};

const baseLabel = ({ matrix, matrixKind }: PrescriptionRow): string =>
  (matrix ? (MatrixLabels as Record<string, string>)[matrix] : null) ??
  (matrixKind
    ? (MatrixKindLabels as Record<string, string>)[matrixKind]
    : null) ??
  matrix ??
  matrixKind ??
  'Sans matrice';

const buildLabels = (prescriptions: PrescriptionRow[]): Map<string, string> => {
  const occurrences = prescriptions.reduce<Record<string, number>>(
    (acc, prescription) => {
      const label = baseLabel(prescription);
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return new Map(
    prescriptions.map((prescription) => {
      const label = baseLabel(prescription);
      const context = prescription.context;
      return [
        prescription.id,
        occurrences[label] > 1 && context
          ? `${label} - ${(ContextLabels as Record<string, string>)[context] ?? context}`
          : label
      ];
    })
  );
};

export const up = async (knex: Knex) => {
  const plans = await knex('programming_plans')
    .select(
      'id',
      'stages',
      'stagesManaged',
      'settingsCompleted',
      'analysisPermissionRole',
      'contactListId',
      'withSacha'
    )
    .where('distributionKind', 'REGIONAL');

  for (const plan of plans) {
    const subPlans = await knex('programming_sub_plans_raw')
      .select('*')
      .where('programmingPlanId', plan.id);

    if (subPlans.length > 1) {
      continue;
    }

    const prescriptions: PrescriptionRow[] = await knex('prescriptions')
      .select('id', 'matrixKind', 'matrix', 'context')
      .where('programmingPlanId', plan.id);

    if (prescriptions.length === 0) {
      continue;
    }

    const labels = buildLabels(prescriptions);
    const ordered = [...prescriptions].sort((a, b) =>
      (labels.get(a.id) as string).localeCompare(
        labels.get(b.id) as string,
        'fr'
      )
    );

    const source = subPlans[0];
    const settings = {
      stages: source?.stages ?? plan.stages ?? [],
      stagesManaged: source?.stagesManaged ?? true,
      settingsCompleted: source?.settingsCompleted ?? plan.settingsCompleted,
      analysisPermissionRole:
        source?.analysisPermissionRole ?? plan.analysisPermissionRole,
      contactListId: source?.contactListId ?? plan.contactListId,
      withSacha: source?.withSacha ?? plan.withSacha,
      substanceKinds: source?.substanceKinds ?? ['Any']
    };

    const subPlanIdByPrescriptionId = new Map<string, string>();

    for (const [index, prescription] of ordered.entries()) {
      const subPlanNumber = `${PPVPrefix}${String(index + 1).padStart(2, '0')}`;
      const label = labels.get(prescription.id) as string;

      if (index === 0 && source) {
        await knex('programming_sub_plans_raw')
          .where('id', source.id)
          .update({ subPlanNumber, label });
        subPlanIdByPrescriptionId.set(prescription.id, source.id);
        continue;
      }

      const id = uuidv4();
      await knex('programming_sub_plans_raw').insert({
        id,
        programmingPlanId: plan.id,
        subPlanNumber,
        label,
        ...settings
      });
      subPlanIdByPrescriptionId.set(prescription.id, id);

      if (source) {
        await knex.raw(
          `insert into laboratory_agreements
             (laboratory_id, programming_sub_plan_id, substance_kind,
              reference_laboratory, detection_analysis, confirmation_analysis)
           select laboratory_id, ?, substance_kind,
                  reference_laboratory, detection_analysis, confirmation_analysis
           from laboratory_agreements
           where programming_sub_plan_id = ?`,
          [id, source.id]
        );

        await knex.raw(
          `insert into laboratory_agreement_checks
             (programming_sub_plan_id, substance_kind, checked_at, checked_by)
           select ?, substance_kind, checked_at, checked_by
           from laboratory_agreement_checks
           where programming_sub_plan_id = ?`,
          [id, source.id]
        );

        const fields = await knex('programming_sub_plan_fields_raw')
          .select('*')
          .where('programmingSubPlanId', source.id);

        for (const field of fields) {
          const [{ id: fieldRowId }] = await knex(
            'programming_sub_plan_fields_raw'
          )
            .insert({
              programmingSubPlanId: id,
              fieldId: field.fieldId,
              required: field.required,
              order: field.order,
              inheritance: field.inheritance
            })
            .returning('id');

          await knex.raw(
            `insert into programming_sub_plan_field_options
               (programming_sub_plan_field_id, specific_data_field_option_id)
             select ?, specific_data_field_option_id
             from programming_sub_plan_field_options
             where programming_sub_plan_field_id = ?`,
            [fieldRowId, field.id]
          );
        }
      }
    }

    for (const [prescriptionId, subPlanId] of subPlanIdByPrescriptionId) {
      await knex('prescriptions')
        .where('id', prescriptionId)
        .update({ programmingSubPlanId: subPlanId });
    }

    await knex.raw(
      `update samples s
       set programming_sub_plan_id = p.programming_sub_plan_id
       from prescriptions p
       where p.id = s.prescription_id
         and p.programming_plan_id = ?`,
      [plan.id]
    );

    await knex.raw(
      `update samples s
       set programming_sub_plan_id = matched.programming_sub_plan_id
       from (select distinct on (matrix_kind) matrix_kind, programming_sub_plan_id
             from prescriptions
             where programming_plan_id = ?
             order by matrix_kind, programming_sub_plan_id) matched
       where s.programming_plan_id = ?
         and s.prescription_id is null
         and s.matrix_kind = matched.matrix_kind`,
      [plan.id, plan.id]
    );

    await knex.raw(
      `update samples s
       set programming_sub_plan_id = null
       where s.programming_plan_id = ?
         and not exists (select 1 from programming_sub_plans_raw sp
                         where sp.id = s.programming_sub_plan_id)`,
      [plan.id]
    );
  }
};

export const down = async (knex: Knex) => {
  const plans = await knex('programming_plans')
    .select('id')
    .where('distributionKind', 'REGIONAL');

  for (const plan of plans) {
    const first = await knex('programming_sub_plans_raw')
      .select('id')
      .where('programmingPlanId', plan.id)
      .andWhere('subPlanNumber', `${PPVPrefix}01`)
      .first();

    if (!first) {
      continue;
    }

    await knex('prescriptions')
      .where('programmingPlanId', plan.id)
      .update({ programmingSubPlanId: first.id });

    await knex('samples')
      .where('programmingPlanId', plan.id)
      .update({ programmingSubPlanId: first.id });

    await knex('programming_sub_plans_raw')
      .where('programmingPlanId', plan.id)
      .andWhereNot('id', first.id)
      .delete();

    await knex('programming_sub_plans_raw')
      .where('id', first.id)
      .update({ subPlanNumber: PPVPrefix });
  }
};
