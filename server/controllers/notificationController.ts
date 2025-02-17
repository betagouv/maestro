import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import notificationRepository from '../repositories/notificationRepository';

const findNotifications = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  console.info('Find notifications');

  const notifications = await notificationRepository.findMany({
    userId: user.id
  });

  response.status(constants.HTTP_STATUS_OK).send(notifications);
};

export default {
  findNotifications
};
