import { z } from 'zod/v4';

export const ResidueCompliance = z.enum(
  ['Compliant', 'NonCompliant', 'Other'],
  {
    error: () => 'Veuillez renseigner la conformité.'
  }
);

export type ResidueCompliance = z.infer<typeof ResidueCompliance>;

export const ResidueComplianceList: ResidueCompliance[] =
  ResidueCompliance.options;

export const ResidueComplianceLabels: Record<ResidueCompliance, string> = {
  Compliant: 'Conforme',
  NonCompliant: 'Non conforme',
  Other: 'Autre'
};
