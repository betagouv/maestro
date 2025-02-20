import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Context } from '../ProgrammingPlan/Context';
import { User } from '../User/User';
import { NotificationCategory } from './NotificationCategory';

export const Notification = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  recipientId: z.string().uuid(),
  category: NotificationCategory,
  message: z.string(),
  link: z.string().nullish(),
  read: z.boolean(),
  author: User.nullish()
});

export const NotificationToCreate = Notification.pick({
  category: true,
  message: true,
  link: true,
  author: true
});

export const NewRegionalPrescriptionCommentNotification =
  NotificationToCreate.extend({
    category: Context,
    matrixKind: MatrixKind,
    sampleCount: z.number(),
    comment: z.string()
  });

export const SubmittedProgrammingPlanNotification = NotificationToCreate.extend(
  {
    category: z.literal('ProgrammingPlanSubmitted')
  }
);

export const ValidatedProgrammingPlanNotification = NotificationToCreate.extend(
  {
    category: z.literal('ProgrammingPlanValidated')
  }
);

export const NotificationUpdate = Notification.pick({
  read: true
});

export type Notification = z.infer<typeof Notification>;
export type NotificationToCreate = z.infer<typeof NotificationToCreate>;
export type NewRegionalPrescriptionCommentNotification = z.infer<
  typeof NewRegionalPrescriptionCommentNotification
>;
export type SubmittedProgrammingPlanNotification = z.infer<
  typeof SubmittedProgrammingPlanNotification
>;
export type ValidatedProgrammingPlanNotification = z.infer<
  typeof ValidatedProgrammingPlanNotification
>;
export type NotificationUpdate = z.infer<typeof NotificationUpdate>;
