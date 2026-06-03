import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { kysely } from './kysely';
import type { ProgrammingSubPlans as ProgrammingSubPlansRow } from './kysely.type';

const toSubPlan = (row: ProgrammingSubPlansRow): ProgrammingSubPlan => ({
  id: ProgrammingSubPlanId.parse(row.id),
  programmingPlanId: row.programmingPlanId,
  codeNat: row.codeNat,
  stages: row.stages,
  label: row.label,
  analysisPermissionRole: row.analysisPermissionRole,
  contactListId: row.contactListId,
  withSacha: row.withSacha
});

const findById = async (
  id: ProgrammingSubPlanId
): Promise<ProgrammingSubPlan | undefined> => {
  const row = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!row) return undefined;
  return toSubPlan(row);
};

const findByProgrammingPlanId = async (
  programmingPlanId: string
): Promise<ProgrammingSubPlan[]> => {
  const rows = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('programmingPlanId', '=', programmingPlanId)
    .orderBy('codeNat')
    .execute();

  return rows.map(toSubPlan);
};

const findManyByIds = async (
  ids: ProgrammingSubPlanId[]
): Promise<ProgrammingSubPlan[]> => {
  if (ids.length === 0) return [];
  const rows = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .where('id', 'in', ids)
    .execute();

  return rows.map(toSubPlan);
};

const findAll = async (): Promise<ProgrammingSubPlan[]> => {
  const rows = await kysely
    .selectFrom('programmingSubPlans')
    .selectAll()
    .execute();

  return rows.map(toSubPlan);
};

export const programmingSubPlanRepository = {
  findById,
  findByProgrammingPlanId,
  findManyByIds,
  findAll
};
