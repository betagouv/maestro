import SendEmailError from 'maestro-shared/errors/sendEmailError';
import config from '../../utils/config';
import {
  MailService,
  SendOptions,
  TemplateName,
  Templates
} from './mailService';

class BrevoService implements MailService {
  apiKey: string;

  constructor() {
    if (!config.mailer.apiKey) {
      throw new Error('Provide an API key for Brevo');
    }
    this.apiKey = config.mailer.apiKey;
  }

  async send<T extends TemplateName>(options: SendOptions<T>): Promise<void> {
    const brevoUrl = 'https://api.brevo.com/v3/smtp/email';
    const body = {
      ...options,
      templateId: Templates[options.templateName].id,
      to: options.recipients.map((recipient) => ({
        email: recipient
      }))
    };

    const response = await fetch(brevoUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error(response.statusText)
      throw new SendEmailError();
    }
  }
}

export default function createNodemailerService(): MailService {
  return new BrevoService();
}
