import { z } from 'zod/v4';
import { User } from '../User/User';
import { NotificationCategory } from './NotificationCategory';

export const Notification = z.object({
  id: z.guid(),
  createdAt: z.coerce.date(),
  recipientId: z.guid(),
  read: z.boolean(),
  message: z.string(),
  link: z.string(),
  author: User.nullish(),
  category: NotificationCategory
});

export type Notification = z.infer<typeof Notification>;
export type NotificationUpdate = z.infer<typeof NotificationUpdate>;

export const NotificationUpdate = Notification.pick({
  read: true
});
