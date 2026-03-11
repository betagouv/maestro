import { z } from 'zod';

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
