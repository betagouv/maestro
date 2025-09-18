import z from 'zod';
import { FindNotificationOptions } from '../schema/Notification/FindNotificationOptions';
import {
  Notification,
  NotificationUpdate
} from '../schema/Notification/Notification';
import { SubRoutes } from './routes';

export const notificationsRoutes = {
  '/notifications': {
    params: undefined,
    get: {
      query: FindNotificationOptions,
      response: z.array(Notification),
      permissions: 'NONE'
    },
    put: {
      body: NotificationUpdate,
      query: FindNotificationOptions,
      permissions: 'NONE',
      response: z.array(Notification)
    }
  },
  '/notifications/:notificationId': {
    params: {
      notificationId: z.guid()
    },
    put: {
      body: NotificationUpdate,
      permissions: 'NONE',
      response: Notification
    }
  }
} as const satisfies SubRoutes<'/notifications'>;
