import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import {
  NewRegionalPrescriptionCommentNotification,
  NotificationToCreate,
  SubmittedProgrammingPlanNotification,
  ValidatedProgrammingPlanNotification
} from 'maestro-shared/schema/Notification/Notification';
import { NotificationCategoryTitles } from 'maestro-shared/schema/Notification/NotificationCategory';
import { User } from 'maestro-shared/schema/User/User';
import { v4 as uuidv4 } from 'uuid';
import notificationRepository from '../repositories/notificationRepository';
import { mailService } from './mailService';
import { mattermostService } from './mattermostService';
const sendNotification = async <T extends NotificationToCreate>(
  notificationToCreate: T,
  recipients: Pick<User, 'id' | 'email'>[]
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

  if (
    NewRegionalPrescriptionCommentNotification.safeParse(notificationToCreate)
      .success
  ) {
    const notification =
      NewRegionalPrescriptionCommentNotification.parse(notificationToCreate);
    mailService.sendNewRegionalPrescriptionComment({
      recipients: recipients.map((recipient) => recipient.email),
      params: {
        matrix: MatrixKindLabels[notification.matrixKind as MatrixKind],
        sampleCount: notification.sampleCount,
        comment: notification.comment,
        author: notification.author
          ? `${notification.author.firstName} ${notification.author.lastName}`
          : 'Anonyme'
      }
    });
  }

  if (
    SubmittedProgrammingPlanNotification.safeParse(notificationToCreate).success
  ) {
    await mailService.sendSubmittedProgrammingPlan({
      recipients: recipients.map((recipient) => recipient.email)
    });
  }

  if (
    ValidatedProgrammingPlanNotification.safeParse(notificationToCreate).success
  ) {
    await mailService.sendValidatedProgrammingPlan({
      recipients: recipients.map((recipient) => recipient.email)
    });
  }
};

export const notificationService = { sendNotification };
