import { z } from 'zod';

const ProgrammingPlanKindWithSacha = z.enum([
  'DAOA_BREEDING',
  'DAOA_SLAUGHTER'
]);

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
  DAOA_BREEDING: 'Abattoir / Viande de volaille',
  DAOA_SLAUGHTER: 'Abattoir / Foie de bovin'
};
export const ProgrammingPlanKindListSorted: ProgrammingPlanKind[] = [
  ...ProgrammingPlanKind.options
].sort((a, b) =>
  ProgrammingPlanKindLabels[a].localeCompare(ProgrammingPlanKindLabels[b])
);
