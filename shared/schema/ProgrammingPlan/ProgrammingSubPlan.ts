import { intersection, uniq } from "lodash-es";
import { z } from "zod";
import type { Stage } from "../../referential/Stage";
import { UserRole } from "../User/UserRole";
import { ProgrammingPlanSettings } from "./ProgrammingPlanSettings";

export const ProgrammingSubPlanId = z.string().brand<"ProgrammingSubPlanId">();
export type ProgrammingSubPlanId = z.infer<typeof ProgrammingSubPlanId>;

export const ProgrammingSubPlan = z.object({
  id: ProgrammingSubPlanId,
  programmingPlanId: z.guid(),
  subPlanNumber: z.string(),
  ...ProgrammingPlanSettings.shape,
  settingsCompleted: z.boolean(),
  label: z.string(),
  analysisPermissionRole: UserRole.nullish(),
  contactListId: z.number().int().nullish(),
  withSacha: z.boolean(),
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;

export const isProgrammingSubPlanDeletable = (
  subPlan: Pick<ProgrammingSubPlan, "settingsCompleted">,
): boolean => !subPlan.settingsCompleted;

export const PPVSubPlanNumberPrefix = "PPV";

export const isPPVSubPlanNumber = (subPlanNumber?: string | null): boolean =>
  subPlanNumber?.startsWith(PPVSubPlanNumberPrefix) ?? false;

export const isPPVSubPlan = (
  subPlan?: Pick<ProgrammingSubPlan, "subPlanNumber"> | null,
): boolean => isPPVSubPlanNumber(subPlan?.subPlanNumber);

export const subPlansForStages = <T extends Pick<ProgrammingSubPlan, "stages">>(
  subPlans: T[],
  stages: Stage[],
): T[] =>
  subPlans.filter(
    (subPlan) => intersection(subPlan.stages ?? [], stages).length > 0,
  );

export const stagesFromSubPlans = (
  subPlans: Pick<ProgrammingSubPlan, "stages">[],
): Stage[] => uniq(subPlans.flatMap((subPlan) => subPlan.stages ?? []));
