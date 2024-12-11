import { dbManager } from './db-manager';
import { afterAll, beforeAll } from 'vitest';
import { setMailService } from '../services/mailService';

setMailService({
  send: async () => {},
  sendAnalysisRequest: async () => {},
  sendNewRegionalPrescriptionComment: async () => {},
  sendSubmittedProgrammingPlan: async () => {},
  sendSupportDocumentCopyToOwner: async () => {},
  sendValidatedProgrammingPlan: async () => {},
})

beforeAll(async () => {
  await dbManager.populateDb()
})


afterAll(async () => {
  await dbManager.closeDb()
})
