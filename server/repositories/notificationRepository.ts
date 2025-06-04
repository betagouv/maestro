import { isNil, omitBy } from 'lodash-es';
import { FindNotificationOptions } from 'maestro-shared/schema/Notification/FindNotificationOptions';
import { Notification } from 'maestro-shared/schema/Notification/Notification';
import { User } from 'maestro-shared/schema/User/User';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { z } from 'zod/v4';
import { knexInstance as db } from './db';
import { usersTable } from './userRepository';
const notificationTable = 'notifications';

const NotificationDbo = Notification.omit({
  author: true
}).extend({
  authorId: z.guid().nullish()
});

type NotificationDbo = z.infer<typeof NotificationDbo>;

export const Notifications = () => db<NotificationDbo>(notificationTable);

const insert = async (notification: Notification): Promise<void> => {
  console.info('Insert notification with id', notification.id);
  await Notifications().insert(formatNotification(notification));
};

const update = async (notification: Notification): Promise<void> => {
  console.info('Update notification with id', notification.id);
  await Notifications()
    .where({ id: notification.id })
    .update(formatNotification(notification));
};

const updateMany = async (notifications: Notification[]): Promise<void> => {
  console.info(
    'Update notifications',
    notifications.map((_) => _.id)
  );
  if (notifications.length > 0) {
    await Notifications()
      .insert(notifications.map(formatNotification))
      .onConflict('id')
      .merge();
  }
};

const selectNotifications = () =>
  Notifications()
    .select(
      `${notificationTable}.*`,
      `${notificationTable}.id as notification_id`,
      `${usersTable}.*`,
      `${usersTable}.id as author_id`
    )
    .leftJoin(usersTable, `${notificationTable}.author_id`, `${usersTable}.id`);

const findUnique = async (id: string): Promise<Notification | undefined> => {
  console.info('Find notification', id);
  return selectNotifications()
    .where(`${notificationTable}.id`, id)
    .first()
    .then((notification) =>
      notification ? parseNotification(notification) : undefined
    );
};

const findMany = async (
  findOptions: FindNotificationOptions
): Promise<Notification[]> => {
  console.info('Find notifications');
  return selectNotifications()
    .where(omitBy(findOptions, isNil))
    .orderBy('created_at', 'desc')
    .then((notifications) => notifications.map(parseNotification));
};

export const formatNotification = (
  notification: Notification
): NotificationDbo =>
  NotificationDbo.parse(
    omitBy(
      {
        ...notification,
        authorId: notification.author?.id
      },
      isNil
    )
  );

const parseNotification = (
  notification: NotificationDbo & {
    notificationId: string;
    authorId: string | null;
  }
): Notification =>
  Notification.parse(
    omitBy(
      {
        ...notification,
        id: notification.notificationId,
        author: isDefinedAndNotNull(notification.authorId)
          ? User.parse({
              ...notification,
              id: notification.authorId
            })
          : undefined
      },
      isNil
    )
  );

export default {
  insert,
  update,
  updateMany,
  findUnique,
  findMany
};
