import type { MailService } from './mailService';

export const createFakeMailService = (): MailService => ({
  send: async () => {},
  createContact: async () => {},
  updateContact: async () => {},
  deleteContact: async () => {}
});
