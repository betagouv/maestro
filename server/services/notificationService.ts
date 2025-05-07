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

export type TemplateParams<
  T extends OmitDistributive<
    Notification,
    'id' | 'recipientId' | 'createdAt' | 'read'
  >,
  U = Omit<
    z.infer<
      (typeof Templates)[(typeof categoryToEmailTemplate)[T['category']]]['params']
    >,
    'link'
  >
> = keyof U extends never ? undefined : U;

const sendNotification = async <
  T extends OmitDistributive<
    Notification,
    'id' | 'recipientId' | 'createdAt' | 'read'
  >
>(
  notificationToCreate: T,
  recipients: Pick<User, 'id' | 'email'>[],
  params: TemplateParams<T>
) => {
  await Promise.all(
    recipients.map(async (recipient) => {
      await notificationRepository.insert({
        id: uuidv4(),
        recipientId: recipient.id,
        createdAt: new Date(),
        read: false,
        ...notificationToCreate
      });
    })
  );

  const fullLink = `${config.application.host}${notificationToCreate.link}`;

  await mattermostService.send(
    `[${NotificationCategoryTitles[notificationToCreate.category]}] ${notificationToCreate.message} ${fullLink}`
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
