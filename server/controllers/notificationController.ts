import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { FindNotificationOptions } from 'maestro-shared/schema/Notification/FindNotificationOptions';
import { NotificationUpdate } from 'maestro-shared/schema/Notification/Notification';
import notificationRepository from '../repositories/notificationRepository';

const findNotifications = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const findOptions = request.query as unknown as FindNotificationOptions;

  console.info('Find notifications');

  const notifications = await notificationRepository.findMany({
    ...findOptions,
    recipientId: user.id
  });

  response.status(constants.HTTP_STATUS_OK).send(notifications);
};

const updateNotification = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const { notificationId } = request.params;
  const notificationUpdate = request.body as NotificationUpdate;

  console.info('Update notification with id', notificationId);

  const notification = await notificationRepository.findUnique(notificationId);

  if (!notification) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (notification.recipientId !== user.id) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedNotification = {
    ...notification,
    ...notificationUpdate
  };

  await notificationRepository.update(updatedNotification);

  response.status(constants.HTTP_STATUS_OK).send(updatedNotification);
};

const updateNotifications = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const findOptions = request.query as unknown as FindNotificationOptions;
  const notificationUpdate = request.body as NotificationUpdate;

  console.info('Update notifications');

  const notifications = await notificationRepository.findMany({
    ...findOptions,
    recipientId: user.id
  });

  const updatedNotifications = notifications.map((notification) => ({
    ...notification,
    ...notificationUpdate
  }));

  await notificationRepository.updateMany(updatedNotifications);

  response.status(constants.HTTP_STATUS_OK).send(updatedNotifications);
};

export default {
  findNotifications,
  updateNotification,
  updateNotifications
};
