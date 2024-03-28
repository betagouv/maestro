import { Request, Response } from 'express';
import { constants } from 'http2';
import userRepository from '../repositories/userRepository';

const getUser = async (request: Request, response: Response) => {
  const { userId } = request.params;

  console.info('Get user', userId);

  const user = await userRepository.findUnique(userId);

  if (!user) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.status(constants.HTTP_STATUS_OK).send(user);
};

export default {
  getUser,
};
