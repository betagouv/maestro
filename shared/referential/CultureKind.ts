import { z } from 'zod';
import { PartialSample } from '../schema/Sample/Sample';
export const CultureKind = z.enum(
  ['Z0211', 'PD06A', 'PD08A', 'Z0215', 'Z0153', 'PD05A'],
  {
    error: () => 'Veuillez renseigner le type de culture.'
  }
);

export type CultureKind = z.infer<typeof CultureKind>;

export const CultureKindList: CultureKind[] = CultureKind.options;

export const CultureKindLabels: Record<CultureKind, string> = {
  Z0211: 'Sous serre/conditions de croissance protégées',
  PD06A: 'Production traditionnelle',
  PD08A: 'Production industrielle intensive',
  Z0215: 'Méthode inconnue',
  Z0153: 'Sauvages ou cueillis',
  PD05A: 'Production en plein air'
};

export const getCultureKindLabel = (partialSample: PartialSample) =>
  partialSample.specificData?.programmingPlanKind === 'PPV' &&
  partialSample.specificData.cultureKind
    ? CultureKindLabels[partialSample.specificData.cultureKind]
    : undefined;
