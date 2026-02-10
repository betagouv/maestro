import { z, ZodType } from 'zod';

export const Templates = {
  SampleAnalysisRequestTemplate: {
    id: 19,
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
  SubmittedProgrammingPlanTemplate: {
    id: 3,
    params: z.object({
      sender: z.string()
    })
  },
  ApprovedProgrammingPlanTemplate: {
    id: 13,
    params: z.object({
      region: z.string()
    })
  },
  NewLocalPrescriptionCommentTemplate: {
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
      link: z.url()
    })
  },
  GenericTemplate: {
    id: 25,
    params: z.object({
      object: z.string(),
      content: z.string()
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
