import * as Brevo from '@getbrevo/brevo';
import config from '../../utils/config';
import { MailService, SendOptions } from './mailService';

const SampleAnalysisRequestTemplateId = 1;
const SupportDocumentCopyToOwnerTemplateId = 2;
const SubmittedProgrammingPlanTemplateId = 3;
const ValidatedProgrammingPlanTemplateId = 4;

class BrevoService implements MailService {
  private emailsApi: Brevo.TransactionalEmailsApi;

  constructor() {
    if (!config.mailer.apiKey) {
      throw new Error('Provide an API key for Brevo');
    }

    this.emailsApi = new Brevo.TransactionalEmailsApi();
    this.emailsApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      config.mailer.apiKey
    );
  }

  async send(options: SendOptions): Promise<void> {
    await this.emailsApi.sendTransacEmail({
      ...options,
      templateId: Number(options.templateId),
      to: options.recipients.map((recipient) => ({
        email: recipient,
      })),
    });
  }

  async sendAnalysisRequest(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      templateId: SampleAnalysisRequestTemplateId,
      params: options.params,
    });
  }

  async sendSupportDocumentCopyToOwner(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      templateId: SupportDocumentCopyToOwnerTemplateId,
    });
  }

  async sendSubmittedProgrammingPlan(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      templateId: SubmittedProgrammingPlanTemplateId,
    });
  }

  async sendValidatedProgrammingPlan(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      templateId: ValidatedProgrammingPlanTemplateId,
    });
  }
}

export default function createNodemailerService(): MailService {
  return new BrevoService();
}
