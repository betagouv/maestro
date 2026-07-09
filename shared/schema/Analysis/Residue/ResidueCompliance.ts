import { z } from 'zod';

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

export const ResidueComplianceDAOA = z.enum(
  [
    'Compliant',
    'CompliantWithoutThreshold',
    'ToMonitor',
    'NonCompliant',
    'Uninterpretable'
  ],
  {
    error: () => 'Veuillez renseigner la conformité.'
  }
);

export type ResidueComplianceDAOA = z.infer<typeof ResidueComplianceDAOA>;
/* TODO en attente du front
export const ResidueComplianceDAOALabels: Record<
  ResidueComplianceDAOA,
  string
> = {
  Compliant: 'Conforme',
  CompliantWithoutThreshold: 'Conforme sans seuil',
  ToMonitor: 'À surveiller',
  NonCompliant: 'Non conforme',
  Uninterpretable: 'Ininterprétable'
};*/
