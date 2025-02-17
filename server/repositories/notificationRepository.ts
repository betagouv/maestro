import { isNil, omitBy } from 'lodash-es';
import { FindNotificationOptions } from 'maestro-shared/schema/Notification/FindNotificationOptions';
import { Notification } from 'maestro-shared/schema/Notification/Notification';
import { knexInstance as db } from './db';

const notificationTable = 'notifications';

export const Notifications = () => db<Notification>(notificationTable);

const insert = async (notification: Notification): Promise<void> => {
  console.info('Insert notification with id', notification.id);
  await Notifications().insert(Notification.parse(omitBy(notification, isNil)));
};

const update = async (notification: Notification): Promise<void> => {
  console.info('Update notification with id', notification.id);
  await Notifications()
    .where({ id: notification.id })
    .update(Notification.parse(omitBy(notification, isNil)));
};

const findMany = async (
  findOptions: FindNotificationOptions
): Promise<Notification[]> => {
  console.info('Find notifications');
  return Notifications()
    .where(omitBy(findOptions, isNil))
    .orderBy('created_at', 'desc')
    .then((notifications) =>
      notifications.map((_) => Notification.parse(omitBy(_, isNil)))
    );
};

export default {
  insert,
  update,
  findMany
};
