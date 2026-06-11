import { z } from 'zod';

export const SampleCompliance = z.enum(
  ['Compliant', 'NonCompliant', 'NonCompliantAndHarmful'],
  {
    error: () => 'Conformité non renseignée.'
  }
);

export type SampleCompliance = z.infer<typeof SampleCompliance>;

export const SampleComplianceLabels: Record<SampleCompliance, string> = {
  Compliant: 'Conforme',
  NonCompliant: 'Non conforme',
  NonCompliantAndHarmful: 'Non conforme et préjudiciable à la santé'
};

export const SampleComplianceByCodeNat: Partial<
  Record<string, SampleCompliance[]>
> = {
  PPV: ['Compliant', 'NonCompliant'],
  M01: ['Compliant', 'NonCompliant', 'NonCompliantAndHarmful'],
  M02: ['Compliant', 'NonCompliant', 'NonCompliantAndHarmful']
};
