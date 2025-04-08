import { Notification } from 'maestro-shared/schema/Notification/Notification';
import {
  NotificationCategory,
  NotificationCategoryTitles
} from 'maestro-shared/schema/Notification/NotificationCategory';
import { User } from 'maestro-shared/schema/User/User';
import { v4 as uuidv4 } from 'uuid';
import notificationRepository from '../repositories/notificationRepository';
import { mailService } from './mailService';
import { mattermostService } from './mattermostService';
import { OmitDistributive } from 'maestro-shared/utils/typescript';
import { TemplateName, Templates } from './mailService/mailService';
import { z } from 'zod';

const categoryToEmailTemplate = {
  AnalysisReviewTodo: 'AnalysisReviewTodoTemplate',
  ProgrammingPlanSubmitted: 'SubmittedProgrammingPlanTemplate',
  ProgrammingPlanValidated: 'ValidatedProgrammingPlanTemplate',
  Control: 'NewRegionalPrescriptionCommentTemplate',
  Surveillance: 'NewRegionalPrescriptionCommentTemplate'
} as const satisfies Record<NotificationCategory, TemplateName | null>;

type TemplateParams<
  T extends OmitDistributive<
    Notification,
    'id' | 'recipientId' | 'createdAt' | 'read'
  >
> = typeof categoryToEmailTemplate[T['category']] extends string ? z.infer<(typeof Templates)[(typeof categoryToEmailTemplate)[T['category']]]['params']> : undefined;

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

  await mattermostService.send(
    `[${NotificationCategoryTitles[notificationToCreate.category]}] ${notificationToCreate.message}`
  );

  const emailTemplateName =  categoryToEmailTemplate[notificationToCreate.category]
  if( emailTemplateName !== null ) {
    await mailService.send({
      templateName: emailTemplateName,
      params: params,
      recipients: recipients.map((recipient) => recipient.email)
    });
  }
};

export const notificationService = {  sendNotification };
