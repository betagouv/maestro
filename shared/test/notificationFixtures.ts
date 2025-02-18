import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../schema/Notification/Notification';
import { NotificationCategoryList } from '../schema/Notification/NotificationCategory';
import { oneOf } from './testFixtures';

export const genNotification = (
  data?: Partial<Notification>
): Notification => ({
  id: uuidv4(),
  createdAt: new Date(),
  recipientId: uuidv4(),
  category: oneOf(NotificationCategoryList),
  message: fakerFR.lorem.words(10),
  link: fakerFR.internet.url(),
  read: fakerFR.datatype.boolean(),
  ...data
});
