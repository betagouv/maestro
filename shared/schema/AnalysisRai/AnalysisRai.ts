import { z } from 'zod';

export const AnalysisRaiId = z.guid().brand<'AnalysisRaiId'>();
export type AnalysisRaiId = z.infer<typeof AnalysisRaiId>;

export const AnalysisRaiState = z.enum(['PROCESSED', 'ERROR']);
export type AnalysisRaiState = z.infer<typeof AnalysisRaiState>;

export const AnalysisRaiSource = z.enum(['EMAIL', 'SFTP']);
export type AnalysisRaiSource = z.infer<typeof AnalysisRaiSource>;

export const EmailRaiPayload = z.object({
  emails: z.array(
    z.object({
      messageUid: z.string(),
      subject: z.string().optional(),
      from: z.string().optional(),
      date: z.coerce.date().optional()
    })
  )
});
export type EmailRaiPayload = z.infer<typeof EmailRaiPayload>;

const AnalysisRaiBase = z.object({
  id: AnalysisRaiId,
  analysisId: z.guid().nullable(),
  laboratoryId: z.string().nullable(),
  state: AnalysisRaiState,
  edi: z.boolean(),
  message: z.string().nullable(),
  receivedAt: z.date(),
  createdAt: z.date()
});

export const AnalysisRai = z.discriminatedUnion('source', [
  AnalysisRaiBase.extend({
    source: z.literal('EMAIL'),
    payload: EmailRaiPayload
  }),
  AnalysisRaiBase.extend({
    source: z.literal('SFTP'),
    payload: z.null()
  })
]);

export type AnalysisRai = z.infer<typeof AnalysisRai>;

export type NewAnalysisRai = Omit<AnalysisRai, 'id' | 'createdAt'>;
