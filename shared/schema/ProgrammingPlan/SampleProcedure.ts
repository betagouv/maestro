import { z } from 'zod';
import {
  getSampleMatrixLabels,
  type PartialSampleMatrix
} from '../Sample/SampleMatrix';

export const SampleProcedure = z.object({
  unitCount: z.string().nullable(),
  minQuantity: z.string().nullable(),
  container: z.string().nullable(),
  samplingTemperature: z.string().nullable(),
  storageTemperature: z.string().nullable(),
  maxAnalysisDelay: z.string().nullable()
});
export type SampleProcedure = z.infer<typeof SampleProcedure>;

export const SampleProcedureKey = SampleProcedure.keyof();
export type SampleProcedureKey = z.infer<typeof SampleProcedureKey>;

export const SampleProcedureLabels: Record<SampleProcedureKey, string> = {
  unitCount: 'Nombre d’unités/prélèvement',
  minQuantity: 'Quantité minimale',
  container: 'Contenant',
  samplingTemperature: 'T° de prélèvement',
  storageTemperature: 'T° de conservation',
  maxAnalysisDelay: 'Délai max. avant analyse'
};

export const sampleProcedureItems = (
  sampleProcedure: SampleProcedure | null | undefined,
  matrices: PartialSampleMatrix[] | null | undefined
): { label: string; value: string }[] => {
  const matrixLabels = getSampleMatrixLabels(matrices);
  return [
    ...(matrixLabels.length
      ? [{ label: 'Matière prélevée', value: matrixLabels.join(', ') }]
      : []),
    ...SampleProcedureKey.options.flatMap((key) => {
      const value = sampleProcedure?.[key];
      return value ? [{ label: SampleProcedureLabels[key], value }] : [];
    })
  ];
};
