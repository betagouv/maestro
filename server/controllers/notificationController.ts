import { constants } from 'http2';
import notificationRepository from '../repositories/notificationRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const notificationsRouter = {
  '/notifications': {
    get: async ({ user, query }) => {
      console.info('Find notifications');

      const notifications = await notificationRepository.findMany({
        ...query,
        recipientId: user.id
      });

      return { status: constants.HTTP_STATUS_OK, response: notifications };
    },
    put: async ({ user, query, body }) => {
      console.info('Update notifications');

      const notifications = await notificationRepository.findMany({
        ...query,
        recipientId: user.id
      });

      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        ...body
      }));

      await notificationRepository.updateMany(updatedNotifications);

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedNotifications
      };
    }
  },
  '/notifications/:notificationId': {
    put: async ({ user, body }, { notificationId }) => {
      console.info('Update notification with id', notificationId);

      const notification =
        await notificationRepository.findUnique(notificationId);

      if (!notification) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      if (notification.recipientId !== user.id) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedNotification = {
        ...notification,
        ...body
      };

      await notificationRepository.update(updatedNotification);

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedNotification
      };
    }
  }
} as const satisfies ProtectedSubRouter;
