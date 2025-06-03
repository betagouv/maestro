import { z } from 'zod/v4';
export const OutdoorAccess = z.enum(['PAT1', 'PAT0', 'PATINCO'], {
  error: () => "Veuillez renseigner l'accès à l'extérieur."
});

export type OutdoorAccess = z.infer<typeof OutdoorAccess>;

export const OutdoorAccessList = OutdoorAccess.options;

export const OutdoorAccessLabels: Record<OutdoorAccess, string> = {
  PAT1: 'Oui',
  PAT0: 'Non',
  PATINCO: 'Inconnu'
};
