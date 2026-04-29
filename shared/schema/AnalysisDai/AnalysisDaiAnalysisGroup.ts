import { z } from 'zod';
import { DocumentKind } from '../Document/DocumentKind';
import { Laboratory } from '../Laboratory/Laboratory';
import { SachaCommunicationMethod } from '../Laboratory/SachaCommunicationMethod';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { AnalysisDaiId } from './AnalysisDai';

const analysisDaiAttemptBase = {
  id: AnalysisDaiId,
  analysisId: z.guid(),
  createdAt: z.date(),
  documents: z.array(
    z.object({ id: z.guid(), filename: z.string(), kind: DocumentKind })
  )
};

export const AnalysisDaiAttempt = z.discriminatedUnion('state', [
  z.object({ ...analysisDaiAttemptBase, state: z.literal('PENDING') }),
  z.object({
    ...analysisDaiAttemptBase,
    state: z.literal('ERROR'),
    message: z.string(),
    sentMethod: SachaCommunicationMethod.nullable(),
    edi: z.boolean().nullable(),
    sentAt: z.date()
  }),
  z.object({
    ...analysisDaiAttemptBase,
    state: z.literal('SENT'),
    sentMethod: SachaCommunicationMethod,
    edi: z.boolean(),
    sentAt: z.date()
  })
]);

export type AnalysisDaiAttempt = z.infer<typeof AnalysisDaiAttempt>;

export const AnalysisDaiAnalysisGroup = z.object({
  analysisId: z.guid(),
  sample: z.object({ id: z.guid(), reference: z.string() }),
  analysis: z.object({ itemNumber: z.number(), copyNumber: z.number() }),
  sampleItem: z.object({ substanceKind: SubstanceKind }),
  laboratory: Laboratory.pick({ shortName: true, name: true }).nullable(),
  attempts: z.array(AnalysisDaiAttempt),
  latestAttemptAt: z.date()
});

export type AnalysisDaiAnalysisGroup = z.infer<typeof AnalysisDaiAnalysisGroup>;

export const PaginatedAnalysisDaiAnalyses = z.object({
  analyses: z.array(AnalysisDaiAnalysisGroup),
  total: z.number().int().nonnegative()
});

export type PaginatedAnalysisDaiAnalyses = z.infer<
  typeof PaginatedAnalysisDaiAnalyses
>;
