import { z } from 'zod';
import { SachaCommunicationMethod } from '../Laboratory/SachaCommunicationMethod';

export const AnalysisDaiId = z.guid().brand<'AnalysisDaiId'>();
export type AnalysisDaiId = z.infer<typeof AnalysisDaiId>;

const analysisDaiBase = {
  id: AnalysisDaiId,
  analysisId: z.guid(),
  createdAt: z.date()
};

export const AnalysisDai = z.discriminatedUnion('state', [
  z.object({
    ...analysisDaiBase,
    state: z.literal('PENDING')
  }),
  z.object({
    ...analysisDaiBase,
    state: z.literal('ERROR'),
    message: z.string(),
    sentMethod: SachaCommunicationMethod.nullable(),
    edi: z.boolean().nullable(),
    sentAt: z.coerce.date()
  }),
  z.object({
    ...analysisDaiBase,
    state: z.literal('SENT'),
    sentMethod: SachaCommunicationMethod,
    edi: z.boolean(),
    sentAt: z.coerce.date()
  })
]);

export type AnalysisDai = z.infer<typeof AnalysisDai>;
