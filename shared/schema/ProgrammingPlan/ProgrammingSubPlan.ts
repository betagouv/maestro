import { intersection, uniq } from 'lodash-es';
import { z } from 'zod';
import { type Stage, StageLabels } from '../../referential/Stage';
import { SubstanceKindLabels } from '../Substance/SubstanceKind';
import { UserRole } from '../User/UserRole';
import { ContextLabels, ProgrammingPlanContext } from './Context';
import { ProgrammingPlanSettings } from './ProgrammingPlanSettings';
import { subPlanMatrixNameParts } from './SubPlanMatrices';

export const ProgrammingSubPlanId = z.string().brand<'ProgrammingSubPlanId'>();
export type ProgrammingSubPlanId = z.infer<typeof ProgrammingSubPlanId>;

export const ProgrammingSubPlan = z.object({
  id: ProgrammingSubPlanId,
  programmingPlanId: z.guid(),
  subPlanNumber: z.string(),
  ...ProgrammingPlanSettings.shape,
  settingsCompleted: z.boolean(),
  analysisPermissionRole: UserRole.nullish(),
  contactListId: z.number().int().nullish(),
  withSacha: z.boolean(),
  context: ProgrammingPlanContext.nullable()
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;

export const subPlanLabel = (
  subPlan: Pick<
    ProgrammingSubPlan,
    'stages' | 'matrices' | 'substanceKinds' | 'context'
  >
): string =>
  [
    (subPlan.stages ?? []).map((stage) => StageLabels[stage]).join(', '),
    subPlanMatrixNameParts(subPlan.matrices).join(', '),
    (subPlan.substanceKinds ?? [])
      .map((substanceKind) => SubstanceKindLabels[substanceKind])
      .join(', '),
    subPlan.context ? ContextLabels[subPlan.context] : ''
  ]
    .filter((part) => part !== '')
    .join(' - ');

export const findPrescriptionSubPlan = <
  T extends Pick<ProgrammingSubPlan, 'id'>
>(
  programmingPlans: { subPlans: T[] }[],
  prescription: { programmingSubPlanId: ProgrammingSubPlanId }
): T | undefined =>
  programmingPlans
    .flatMap((programmingPlan) => programmingPlan.subPlans)
    .find((subPlan) => subPlan.id === prescription.programmingSubPlanId);

export const isProgrammingSubPlanDeletable = (
  subPlan: Pick<ProgrammingSubPlan, 'settingsCompleted'>
): boolean => !subPlan.settingsCompleted;

export const PPVSubPlanNumberPrefix = 'PPV';

export const isPPVSubPlanNumber = (subPlanNumber?: string | null): boolean =>
  subPlanNumber?.startsWith(PPVSubPlanNumberPrefix) ?? false;

export const isPPVSubPlan = (
  subPlan?: Pick<ProgrammingSubPlan, 'subPlanNumber'> | null
): boolean => isPPVSubPlanNumber(subPlan?.subPlanNumber);

export const subPlansForStages = <T extends Pick<ProgrammingSubPlan, 'stages'>>(
  subPlans: T[],
  stages: Stage[]
): T[] =>
  subPlans.filter(
    (subPlan) => intersection(subPlan.stages ?? [], stages).length > 0
  );

export const stagesFromSubPlans = (
  subPlans: Pick<ProgrammingSubPlan, 'stages'>[]
): Stage[] => uniq(subPlans.flatMap((subPlan) => subPlan.stages ?? []));
