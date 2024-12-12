import { MailService } from './mailService';

export const createFakeMailService = (): MailService =>
  ( {
    send: async () => {},
    sendAnalysisRequest: async () => {},
    sendNewRegionalPrescriptionComment: async () => {},
    sendSubmittedProgrammingPlan: async () => {},
    sendSupportDocumentCopyToOwner: async () => {},
    sendValidatedProgrammingPlan: async () => {},
  })
