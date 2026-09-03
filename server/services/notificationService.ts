import { Brand } from 'maestro-shared/constants';
import type { Notification } from 'maestro-shared/schema/Notification/Notification';
import {
  type NotificationCategory,
  NotificationCategoryTitles
} from 'maestro-shared/schema/Notification/NotificationCategory';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import type { OmitDistributive } from 'maestro-shared/utils/typescript';
import { v4 as uuidv4 } from 'uuid';
import type { z } from 'zod';
import notificationRepository from '../repositories/notificationRepository';
import config from '../utils/config';
import { mailService } from './mailService';
import type { TemplateName, Templates } from './mailService/mailService';
import { mattermostService } from './mattermostService';

const categoryToEmailTemplate = {
  AnalysisReviewTodo: 'AnalysisReviewTodoTemplate',
  ProgrammingPlanSubmittedToRegion: 'GenericTemplate',
  ProgrammingPlanSubmittedToDepartments: 'GenericTemplate',
  ProgrammingPlanValidated: 'GenericTemplate',
  ProgrammingPlanCampaignLaunched: 'GenericTemplate',
  ProgrammingPlanModifiedAfterSubmission: 'GenericTemplate',
  ProgrammingPlanReadyForAdminReview: 'GenericTemplate',
  LaboratoryAgreementsToManage: 'GenericTemplate',
  LaboratoryAgreementLost: 'GenericTemplate',
  ResourceDocumentUploaded: 'GenericTemplate',
  Control: 'NewLocalPrescriptionCommentTemplate',
  Surveillance: 'NewLocalPrescriptionCommentTemplate',
  Exploratory: 'NewLocalPrescriptionCommentTemplate'
} as const satisfies Record<NotificationCategory, TemplateName | null>;

const NotificationCategoryMessages = {
  Control: ({ matrix }) =>
    `Nouveau commentaire sur la matrice **${matrix.toLowerCase()}**`,
  Surveillance: ({ matrix }) =>
    `Nouveau commentaire sur la matrice **${matrix.toLowerCase()}**`,
  Exploratory: ({ matrix }) =>
    `Nouveau commentaire sur la matrice **${matrix.toLowerCase()}**`,
  ProgrammingPlanSubmittedToRegion: ({ content }) => content,
  ProgrammingPlanSubmittedToDepartments: ({ content }) => content,
  ProgrammingPlanValidated: ({ content }) => content,
  ProgrammingPlanCampaignLaunched: ({ content }) => content,
  ProgrammingPlanModifiedAfterSubmission: ({ content }) => content,
  ProgrammingPlanReadyForAdminReview: ({ content }) => content,
  LaboratoryAgreementsToManage: ({ content }) => content,
  LaboratoryAgreementLost: ({ content }) => content,
  AnalysisReviewTodo: () =>
    `Un rapport d'analyse de l'un de vos prélèvements vient d'être reçu par ${Brand}. Veuillez-vous connecter, faire la vérification des données issues de celui-ci et réaliser l'interprétation globale pour finaliser vos actions sur ce prélèvement.`,
  ResourceDocumentUploaded: ({ content }) => content
} as const satisfies {
  [category in NotificationCategory]: (
    params: TemplateParams<category>
  ) => string;
};

type TemplateParams<
  T extends NotificationCategory,
  U = Omit<
    z.infer<(typeof Templates)[(typeof categoryToEmailTemplate)[T]]['params']>,
    'link'
  >
> = keyof U extends never ? undefined : U;

const sendNotification = async <
  T extends OmitDistributive<
    Notification,
    'id' | 'recipientId' | 'createdAt' | 'read' | 'message'
  >
>(
  notificationToCreate: T,
  recipients: Pick<UserRefined, 'id' | 'email'>[],
  params: TemplateParams<T['category']>,
  options?: { message?: string; additionalEmails?: string[] }
) => {
  const message =
    options?.message ??
    // @ts-expect-error TS2345 il n'arrive pas à faire le lien entre le type de la category dans la notification et les params souhaités. À voir si ça marche avec une nouvelle version de TS
    NotificationCategoryMessages[notificationToCreate.category](params);

  await Promise.all(
    recipients.map(async (recipient) => {
      await notificationRepository.insert({
        id: uuidv4(),
        recipientId: recipient.id,
        createdAt: new Date(),
        read: false,
        message,
        ...notificationToCreate
      });
    })
  );

  const fullLink = `${config.application.host}${notificationToCreate.link}`;

  await mattermostService.send(
    `[${NotificationCategoryTitles[notificationToCreate.category]}] ${message} ${fullLink}`
  );

  const emailTemplateName =
    categoryToEmailTemplate[notificationToCreate.category];
  if (emailTemplateName !== null) {
    await mailService.send({
      templateName: emailTemplateName,
      params: { ...params, link: fullLink },
      recipients: [
        ...new Set([
          ...recipients.map((recipient) => recipient.email),
          ...(options?.additionalEmails ?? [])
        ])
      ]
    });
  }
};

export const notificationService = { sendNotification };
