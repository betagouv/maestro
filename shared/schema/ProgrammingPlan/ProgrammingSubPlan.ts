import { intersection, uniq } from 'lodash-es';
import { z } from 'zod';
import {
  SlaughterhouseStage,
  type Stage,
  StageLabels
} from '../../referential/Stage';
import type { MatrixReferential } from '../Matrix/MatrixReferential';
import { SubstanceKindLabels } from '../Substance/SubstanceKind';
import type { UserRole } from '../User/UserRole';
import { ContextLabels } from './Context';
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
  contactListId: z.number().int().nullish(),
  withSacha: z.boolean()
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;

export const subPlanLabel = (
  referential: MatrixReferential,
  subPlan: Pick<
    ProgrammingSubPlan,
    'stages' | 'matrices' | 'substanceKinds' | 'context'
  >
): string =>
  [
    (subPlan.stages ?? []).map((stage) => StageLabels[stage]).join(', '),
    subPlanMatrixNameParts(referential, subPlan.matrices).join(', '),
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

type SubPlanNumberIssue = 'Empty' | 'Duplicate' | 'PPVPrefix';

export const SubPlanNumberIssueMessages: Record<SubPlanNumberIssue, string> = {
  Empty: 'Veuillez renseigner le code Nat.',
  Duplicate: 'Ce code est déjà utilisé par un autre sous-plan de l’année.',
  PPVPrefix: 'Le préfixe PPV ne peut être ni ajouté ni retiré.'
};

export const subPlanNumberIssue = (
  currentSubPlanNumber: string,
  subPlanNumber: string,
  yearSubPlanNumbers: string[]
): SubPlanNumberIssue | undefined => {
  if (subPlanNumber === currentSubPlanNumber) {
    return undefined;
  }
  if (subPlanNumber.trim() === '') {
    return 'Empty';
  }
  if (
    isPPVSubPlanNumber(subPlanNumber) !==
    isPPVSubPlanNumber(currentSubPlanNumber)
  ) {
    return 'PPVPrefix';
  }
  return yearSubPlanNumbers.includes(subPlanNumber) ? 'Duplicate' : undefined;
};

export const analysisPermissionRoles = (
  subPlan: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'stages'>
): UserRole[] =>
  isPPVSubPlan(subPlan)
    ? ['Sampler', 'RegionalCoordinator']
    : subPlan.stages?.includes(SlaughterhouseStage)
      ? ['DepartmentalCoordinator']
      : ['Sampler', 'DepartmentalCoordinator'];

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
