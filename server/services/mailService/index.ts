import config, { MailProvider } from '../../utils/config';
import createBrevoService from './brevoService';
import { MailService } from './mailService';
import createNodemailerService from './nodemailerService';
import { createFakeMailService } from './fakeService';

const serviceByProvider = {
  'fake': createFakeMailService,
  'brevo': createBrevoService,
  'nodemailer': createNodemailerService
} as const satisfies Record<MailProvider, () => MailService>


export const mailService: MailService = serviceByProvider[config.mailer.provider]()

