import { z, ZodType } from 'zod';

export const Templates = {
  SampleAnalysisRequestTemplate: {
    id: 1,
    params: z.object({
      region: z.string().optional(),
      userMail: z.string(),
      sampledAt: z.string()
    })
  },
  SupportDocumentCopyToOwnerTemplate: {
    id: 2,
    params: z.object({
      region: z.string().optional(),
      sampledAt: z.string()
    })
  },
  SubmittedProgrammingPlanTemplate: { id: 3, params: z.undefined() },
  ApprovedProgrammingPlanTemplate: {
    id: 12, //TODO
    params: z.object({
      region: z.string().optional()
    })
  },
  ValidatedProgrammingPlanTemplate: { id: 4, params: z.undefined() },
  NewRegionalPrescriptionCommentTemplate: {
    id: 5,
    params: z.object({
      matrix: z.string(),
      sampleCount: z.number(),
      comment: z.string(),
      author: z.string()
    })
  },
  AnalysisReviewTodoTemplate: {
    id: 11,
    params: z.object({
      link: z.string().url()
    })
  }
} as const satisfies {
  [templateName: string]: {
    id: number;
    params: ZodType;
  };
};

export type TemplateName = keyof typeof Templates;

export interface SendOptions<T extends TemplateName> {
  recipients: string[];
  templateName: T;
  params: z.infer<(typeof Templates)[T]['params']>;
  attachment?: {
    content: string;
    name: string;
  }[];
}

export interface MailService {
  send<T extends TemplateName>(options: SendOptions<T>): Promise<void>;
}
