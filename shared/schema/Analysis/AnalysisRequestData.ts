import { z } from 'zod';
import { Company } from '../Company/Company';
import { Laboratory } from '../Laboratory/Laboratory';
import { Sample } from '../Sample/Sample';
import { SampleItem } from '../Sample/SampleItem';
import { Substance } from '../Substance/Substance';
import { User } from '../User/User';

export const AnalysisRequestData = z.object({
  ...Sample.shape,
  ...SampleItem.shape,
  sampler: User,
  company: z.object({
    ...Company.shape,
    fullAddress: z.string()
  }),
  laboratory: Laboratory,
  monoSubstances: z.array(Substance.pick({ label: true })),
  multiSubstances: z.array(Substance.pick({ label: true })),
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
  cultureKind: z.string().nullish(),
  compliance200263: z.string(),
  establishment: z.object({
    name: z.string(),
    fullAddress: z.string()
  }),
  department: z.string()
});

export type AnalysisRequestData = z.infer<typeof AnalysisRequestData>;
