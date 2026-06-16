import { z } from 'zod';

export const ContaminationSource = z.enum([
  'EnvironmentalPollutionRemanence',
  'EnvironmentalPollutionVolatility',
  'NaturalInterferences',
  'ExternalDrift',
  'CrossContamination',
  'UnauthorisedPPP',
  'PoorSprayerRinsing',
  'InternalDrift',
  'MisuseOfUse',
  'Overdose',
  'PreviousCropRemanence',
  'UnexplainedCase',
  'Other'
]);

export type ContaminationSource = z.infer<typeof ContaminationSource>;

export const ContaminationSourceList: ContaminationSource[] =
  ContaminationSource.options;

export const ContaminationSourceLabels: Record<ContaminationSource, string> = {
  EnvironmentalPollutionRemanence: 'Pollution environnementale : rémanence',
  EnvironmentalPollutionVolatility: 'Pollution environnementale : volatilité',
  NaturalInterferences: 'Interférences naturelles',
  ExternalDrift: "Dérive extérieure à l'exploitation",
  CrossContamination: 'Contamination croisée',
  UnauthorisedPPP: 'Utilisation de PPP non autorisés',
  PoorSprayerRinsing: 'Mauvais rinçage du pulvérisateur',
  InternalDrift: "Dérive au sein de l'exploitation",
  MisuseOfUse: "Détournement d'usage",
  Overdose: 'Surdosage',
  PreviousCropRemanence: 'Rémanence précédent cultural',
  UnexplainedCase: 'Cas inexpliqué',
  Other: 'Autres'
};
