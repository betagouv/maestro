import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { User } from '../User/User';
import { NotificationCategory } from './NotificationCategory';

export const Notification = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  recipientId: z.string().uuid(),
  category: NotificationCategory,
  message: z.string(),
  link: z.string().nullish(),
  read: z.boolean()
});

export const NotificationToCreate = Notification.pick({
  category: true,
  message: true,
  link: true
});

export const NewRegionalPrescriptionCommentNotification =
  NotificationToCreate.extend({
    category: z.literal('NewRegionalPrescriptionComment'),
    matrixKind: MatrixKind,
    sampleCount: z.number(),
    comment: z.string(),
    author: User
  });

export type Notification = z.infer<typeof Notification>;
export type NotificationToCreate = z.infer<typeof NotificationToCreate>;
export type NewRegionalPrescriptionCommentNotification = z.infer<
  typeof NewRegionalPrescriptionCommentNotification
>;
