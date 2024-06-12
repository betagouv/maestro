import config from '../../utils/config';
import createBrevoService from './brevoService';
import { MailService } from './mailService';
import createNodemailerService from './nodemailerService';

const mailService: MailService =
  config.mailer.provider === 'brevo'
    ? createBrevoService()
    : createNodemailerService();

export default mailService;
