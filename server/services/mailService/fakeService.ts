import { MailService } from './mailService';

export const createFakeMailService = (): MailService => ({
  send: async () => {}
});
