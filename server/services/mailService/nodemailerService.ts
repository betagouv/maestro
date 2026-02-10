import nodemailer from 'nodemailer';
import config from '../../utils/config';
import { MailService, SendOptions, TemplateName } from './mailService';

const TemplateData = {
  SampleAnalysisRequestTemplate: {
    subject: "Réception à venir d'un prélèvement",
    content: `Vous allez bientôt recevoir un prélèvement`
  },
  SupportDocumentCopyToOwnerTemplate: {
    subject: 'Copie du document d’accompagnement',
    content: 'Voici une copie de votre document d’accompagnement'
  },
  SubmittedProgrammingPlanTemplate: {
    subject: 'Plan de programmation',
    content: 'Le plan de programmation a été soumis'
  },
  ApprovedProgrammingPlanTemplate: {
    subject: 'Plan de programmation approuvé',
    content: 'Le plan de programmation a été approuvé'
  },
  NewLocalPrescriptionCommentTemplate: {
    subject: 'Nouveau commentaire',
    content: 'Un nouveau commentaire a été ajouté'
  },
  AnalysisReviewTodoTemplate: {
    subject: "Rapport d'analyse reçu",
    content: "Un de vos rapports d'analyse vient d'être reçu"
  },
  GenericTemplate: {
    subject: 'Nouveau message',
    content: 'Vous avez reçu un nouveau message'
  }
} as const satisfies Record<
  TemplateName,
  {
    subject: string;
    content: string;
  }
>;
class NodemailerService implements MailService {
  private transport: nodemailer.Transporter<nodemailer.SentMessageInfo>;

  constructor() {
    this.transport = nodemailer.createTransport({
      host: config.mailer.host ?? undefined,
      port: config.mailer.port ?? undefined,
      secure: config.mailer.secure ?? undefined,
      auth: {
        user: config.mailer.user ?? undefined,
        pass: config.mailer.password ?? undefined
      }
    });
  }

  async send<T extends TemplateName>(options: SendOptions<T>): Promise<void> {
    return this.transport.sendMail({
      from: config.mail.from,
      to: options.recipients.join(','),
      subject: TemplateData[options.templateName].subject,
      html: TemplateData[options.templateName].content,
      attachments: options.attachment?.map((a) => ({
        filename: a.name,
        content: a.content,
        encoding: 'base64'
      }))
    });
  }
}

export default function createNodemailerService(): MailService {
  return new NodemailerService();
}
