import nodemailer from 'nodemailer';
import config from '../../utils/config';
import { MailService, SendOptions } from './mailService';

class NodemailerService implements MailService {
  private transport: nodemailer.Transporter<nodemailer.SentMessageInfo>;

  constructor() {
    this.transport = nodemailer.createTransport({
      host: config.mailer.host ?? undefined,
      port: config.mailer.port ?? undefined,
      secure: config.mailer.secure ?? undefined,
      auth: {
        user: config.mailer.user ?? undefined,
        pass: config.mailer.password ?? undefined,
      },
    });
  }

  async send(options: SendOptions): Promise<void> {
    return this.transport.sendMail({
      from: config.mail.from,
      to: options.recipients.join(','),
      subject: options.subject,
      html: options.content,
    });
  }

  async sendAnalysisRequest(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      subject: "Réception à venir d'un prélèvement",
      content: `Vous allez bientôt recevoir un prélèvement`,
    });
  }

  async sendSupportDocumentCopyToOwner(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      subject: 'Copie du document d’accompagnement',
      content: 'Voici une copie de votre document d’accompagnement',
    });
  }

  async sendSubmittedProgrammingPlan(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      subject: 'Plan de programmation',
      content: 'Le plan de programmation a été soumis',
    });
  }

  async sendValidatedProgrammingPlan(options: SendOptions): Promise<void> {
    return this.send({
      ...options,
      subject: 'Plan de programmation validé',
      content: 'Le plan de programmation a été validé',
    });
  }
}

export default function createNodemailerService(): MailService {
  return new NodemailerService();
}
