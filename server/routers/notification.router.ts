import express from 'express';
import { FindNotificationOptions } from 'maestro-shared/schema/Notification/FindNotificationOptions';
import { NotificationUpdate } from 'maestro-shared/schema/Notification/Notification';
import notificationController from '../controllers/notificationController';
import validator, { body, query, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/',
  validator.validate(query(FindNotificationOptions)),
  notificationController.findNotifications
);

router.put(
  '/:notificationId',
  validator.validate(
    uuidParam('notificationId').merge(body(NotificationUpdate))
  ),
  notificationController.updateNotification
);
router.put(
  '/',
  validator.validate(
    query(FindNotificationOptions).merge(body(NotificationUpdate))
  ),
  notificationController.updateNotifications
);

export default router;
