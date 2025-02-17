import express from 'express';
import notificationController from '../controllers/notificationController';

const router = express.Router();

router.get('/notifications', notificationController.findNotifications);

export default router;
