import config from '../../utils/config';
import createBrevoService from './brevoService';
import { MailService } from './mailService';
import createNodemailerService from './nodemailerService';

export let mailService: MailService =
  config.mailer.provider === 'brevo'
    ? createBrevoService()
    : createNodemailerService();

export const setMailService = (emailService: MailService) => (mailService = emailService)

