import { z } from 'zod';
import { DocumentKind } from '../Document/DocumentKind';
import { Laboratory } from '../Laboratory/Laboratory';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { AnalysisRai } from './AnalysisRai';

export const AnalysisRaiWithRelations = z.intersection(
  AnalysisRai,
  z.object({
    sample: z.object({ id: z.guid(), reference: z.string() }).nullable(),
    sampleItem: z.object({ substanceKind: SubstanceKind }).nullable(),
    laboratory: Laboratory.pick({
      id: true,
      shortName: true,
      name: true
    }).nullable(),
    documents: z.array(
      z.object({ id: z.guid(), filename: z.string(), kind: DocumentKind })
    )
  })
);

export type AnalysisRaiWithRelations = z.infer<typeof AnalysisRaiWithRelations>;

export const PaginatedAnalysisRai = z.object({
  rais: z.array(AnalysisRaiWithRelations),
  total: z.number().int().nonnegative()
});

export type PaginatedAnalysisRai = z.infer<typeof PaginatedAnalysisRai>;
