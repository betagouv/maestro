import { z } from 'zod';

export const ProgrammingPlanKind = z.enum(
  ['PPV', 'DAOA_BREEDING', 'DAOA_SLAUGHTER'],
  {
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;

export const ProgrammingPlanDAOAKindList: ProgrammingPlanKind[] = [
  'DAOA_BREEDING',
  'DAOA_SLAUGHTER'
];

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
