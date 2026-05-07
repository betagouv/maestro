import { z } from 'zod';
import type { UserRole } from '../User/UserRole';

export const ProgrammingPlanKindWithSacha = z.enum([
  'DAOA_VOLAILLE',
  'DAOA_BOVIN'
]);

export type ProgrammingPlanKindWithSacha = z.infer<
  typeof ProgrammingPlanKindWithSacha
>;

export const ProgrammingPlanKind = z.enum([
  'PPV',
  ...ProgrammingPlanKindWithSacha.options
]);

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;
export const ProgrammingPlanKindWithSachaList =
  ProgrammingPlanKindWithSacha.options;

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindLabels: Record<ProgrammingPlanKind, string> = {
  PPV: 'Production primaire végétale',
  DAOA_VOLAILLE: 'Abattoir / Viande de volaille',
  DAOA_BOVIN: 'Abattoir / Foie de bovin'
};
export const ProgrammingPlanKindListSorted: ProgrammingPlanKind[] = [
  ...ProgrammingPlanKind.options
].sort((a, b) =>
  ProgrammingPlanKindLabels[a].localeCompare(ProgrammingPlanKindLabels[b])
);

export const ProgrammingPlanAnalysisPermissionRole: Record<
  ProgrammingPlanKind,
  UserRole
> = {
  PPV: 'Sampler',
  DAOA_VOLAILLE: 'DepartmentalCoordinator',
  DAOA_BOVIN: 'DepartmentalCoordinator'
};

export const ProgrammingPlanKindBrevoListId: Record<
  ProgrammingPlanKind,
  number
> = {
  PPV: 9,
  DAOA_VOLAILLE: 7,
  DAOA_BOVIN: 7
};

//TODO à mettre en BDD
export const ProgrammingPlanKindReference: Record<ProgrammingPlanKind, string> =
  {
    PPV: '1000',
    DAOA_VOLAILLE: '1001',
    DAOA_BOVIN: '1002'
  };
