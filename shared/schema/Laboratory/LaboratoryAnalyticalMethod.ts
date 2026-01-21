import { z } from 'zod';

export const LaboratoryAnalyticalMethod = z.enum(
  ['F009A', 'F024A', 'F027A', 'F329A', 'F046A', 'F049A'],
  {
    error: () => 'Veuillez renseigner la méthode analytique.'
  }
);

export type LaboratoryAnalyticalMethod = z.infer<
  typeof LaboratoryAnalyticalMethod
>;

export const LaboratoryAnalyticalMethodList =
  LaboratoryAnalyticalMethod.options;

export const LaboratoryAnalyticalMethodLabels: Record<
  LaboratoryAnalyticalMethod,
  string
> = {
  F009A: 'Spectroscopie UV-visible',
  F024A: 'HPLC-Electrical Conductivity Detector',
  F027A: 'Chromatographie liquide - Spectrométrie masse tandem',
  F329A: 'Chromatographie liquide - Spectrométrie de masse haute résolution',
  F046A: 'Chromatographie gazeuse - Spectrométrie de masse',
  F049A: 'Chromatographie gazeuse - Spectrométrie de masse en tandem'
};
