import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const SampleCompliance = z.enum(
  ['Compliant', 'NonCompliant', 'NonCompliantAndHarmful'],
  {
    error: () => 'Conformité non renseignée.'
  }
);

export type SampleCompliance = z.infer<typeof SampleCompliance>;

export const SampleComplianceList: SampleCompliance[] =
  SampleCompliance.options;

export const SampleComplianceLabels: Record<SampleCompliance, string> = {
  Compliant: 'Conforme',
  NonCompliant: 'Non conforme',
  NonCompliantAndHarmful: 'Non conforme et préjudiciable à la santé'
};

export const SampleComplianceByProgrammingPlanKind: Record<
  ProgrammingPlanKind,
  SampleCompliance[]
> = {
  [ProgrammingPlanKind.enum.PPV]: ['Compliant', 'NonCompliant'],
  [ProgrammingPlanKind.enum.DAOA_VOLAILLE]: [
    'Compliant',
    'NonCompliant',
    'NonCompliantAndHarmful'
  ],
  [ProgrammingPlanKind.enum.DAOA_BOVIN]: [
    'Compliant',
    'NonCompliant',
    'NonCompliantAndHarmful'
  ]
};
