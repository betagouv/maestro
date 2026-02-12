import { z } from 'zod';
import { Company } from '../Company/Company';
import { Laboratory } from '../Laboratory/Laboratory';
import { SampleBase } from '../Sample/Sample';
import { SampleItem } from '../Sample/SampleItem';
import { UserBase } from '../User/User';

export const AnalysisRequestData = z.object({
  ...SampleBase.shape,
  ...SampleItem.shape,
  sampler: UserBase,
  company: z.object({
    ...Company.shape,
    fullAddress: z.string()
  }),
  laboratory: Laboratory,
  monoSubstanceLabels: z.array(z.string()),
  multiSubstanceLabels: z.array(z.string()),
  reference: z.string(),
  sampledAt: z.string(),
  sampledAtDate: z.string(),
  sampledAtTime: z.string(),
  context: z.string(),
  legalContext: z.string(),
  stage: z.string(),
  matrixKindLabel: z.string(),
  matrixLabel: z.string(),
  matrixPart: z.string(),
  quantityUnit: z.string(),
  productionKind: z.string().nullish(),
  cultureKind: z.string().nullish(),
  compliance200263: z.string(),
  establishment: z.object({
    name: z.string(),
    fullAddress: z.string()
  }),
  department: z.string()
});

export type AnalysisRequestData = z.infer<typeof AnalysisRequestData>;
