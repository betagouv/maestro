import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import {
  NewRegionalPrescriptionCommentNotification,
  NotificationToCreate
} from 'maestro-shared/schema/Notification/Notification';
import { User } from 'maestro-shared/schema/User/User';
import { v4 as uuidv4 } from 'uuid';
import notificationRepository from '../repositories/notificationRepository';
import { mailService } from './mailService';
const sendNotification = async <T extends NotificationToCreate>(
  notificationToCreate: T,
  recipients: User[]
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

  //TODO
  // Mattermost notification

  if (
    NewRegionalPrescriptionCommentNotification.safeParse(notificationToCreate)
  ) {
    const notification =
      NewRegionalPrescriptionCommentNotification.parse(notificationToCreate);
    mailService.sendNewRegionalPrescriptionComment({
      recipients: recipients.map((recipient) => recipient.email),
      params: {
        matrix: MatrixKindLabels[notification.matrixKind as MatrixKind],
        sampleCount: notification.sampleCount,
        comment: notification.comment,
        author: `${notification.author.firstName} ${notification.author.lastName}`
      }
    });
  }
};

export const notificationService = { sendNotification };
