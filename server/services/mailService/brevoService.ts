import config from '../../utils/config';
import { MailService, SendOptions, TemplateName } from './mailService';

class BrevoService implements MailService {
  // private emailsApi: Brevo.TransactionalEmailsApi;

  constructor() {
    if (!config.mailer.apiKey) {
      throw new Error('Provide an API key for Brevo');
    }

    // this.emailsApi = new Brevo.TransactionalEmailsApi();
    // this.emailsApi.setApiKey(
    //   Brevo.TransactionalEmailsApiApiKeys.apiKey,
    //   config.mailer.apiKey
    // );
  }

  async send<T extends TemplateName>(_options: SendOptions<T>): Promise<void> {
    // await this.emailsApi.sendTransacEmail({
    //   ...options,
    //   templateId: Templates[options.templateName].id,
    //   to: options.recipients.map((recipient) => ({
    //     email: recipient
    //   }))
    // });
  }

}

export default function createNodemailerService(): MailService {
  return new BrevoService();
}
