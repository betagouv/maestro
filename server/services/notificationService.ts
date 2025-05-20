import { Brand } from 'maestro-shared/constants';
import { Notification } from 'maestro-shared/schema/Notification/Notification';
import {
  NotificationCategory,
  NotificationCategoryTitles
} from 'maestro-shared/schema/Notification/NotificationCategory';
import { User } from 'maestro-shared/schema/User/User';
import { OmitDistributive } from 'maestro-shared/utils/typescript';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import notificationRepository from '../repositories/notificationRepository';
import config from '../utils/config';
import { mailService } from './mailService';
import { TemplateName, Templates } from './mailService/mailService';
import { mattermostService } from './mattermostService';

const categoryToEmailTemplate = {
  AnalysisReviewTodo: 'AnalysisReviewTodoTemplate',
  ProgrammingPlanSubmitted: 'SubmittedProgrammingPlanTemplate',
  ProgrammingPlanApproved: 'ApprovedProgrammingPlanTemplate',
  ProgrammingPlanValidated: 'ValidatedProgrammingPlanTemplate',
  Control: 'NewRegionalPrescriptionCommentTemplate',
  Surveillance: 'NewRegionalPrescriptionCommentTemplate'
} as const satisfies Record<NotificationCategory, TemplateName | null>;

const NotificationCategoryMessages = {
  Control: ({ matrix }) =>
    `Nouveau commentaire sur la matrice **${matrix.toLowerCase()}**`,
  Surveillance: ({ matrix }) =>
    `Nouveau commentaire sur la matrice **${matrix.toLowerCase()}**`,
  ProgrammingPlanSubmitted: () => `
${Brand} vient d’être mis à jour !  

Une proposition de programmation pour la prochaine campagne de surveillance / contrôle officielle a été déposée sur ${Brand}  par la coordination nationale.   

Merci de prendre connaissance de ces nouveaux éléments et y réagir le cas échéant.`,
  ProgrammingPlanApproved: ({ region }) => `
La programmation de prélèvements pour la prochaine campagne de surveillance / contrôle officielle a été approuvée par la région ${region}
  `,
  ProgrammingPlanValidated: () => `
L’étape de programmation a été clôturée par la coordination nationale.  

En tant que coordinateur régional, vous pouvez dorénavant vous connecter à ${Brand} sur l’espace "programmation" afin d’attribuer le/les laboratoires responsables des analyses officielles en lien avec les matrices programmées pour la prochaine campagne du dispositif PSPC dans votre région.  

Une fois le/les laboratoires attribués, la campagne sera officiellement lancée et les inspecteurs/préleveurs de vos régions pourront initier leurs prélèvements.`,
  AnalysisReviewTodo: () =>
    `Un rapport d'analyse de l'un de vos prélèvements vient d'être reçu par ${Brand}. Veuillez-vous connecter, faire la vérification des données issues de celui-ci et réaliser l'interprétation globale pour finaliser vos actions sur ce prélèvement.`
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
  recipients: Pick<User, 'id' | 'email'>[],
  params: TemplateParams<T['category']>
) => {
  const message =
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
      recipients: recipients.map((recipient) => recipient.email)
    });
  }
};

export const notificationService = { sendNotification };
