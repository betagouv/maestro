import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import fp from 'lodash';
import { FindUserOptions } from '../../shared/schema/User/FindUserOptions';
import { UserInfos } from '../../shared/schema/User/User';
import userRepository from '../repositories/userRepository';

const getUserInfos = async (request: Request, response: Response) => {
  const { userId } = request.params;
  const { userId: authUserId } = (request as AuthenticatedRequest).auth;

  console.info('Get user', userId);

  const user = await userRepository.findUnique(userId);

  if (!user) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (user.id !== authUserId) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const userInfos: UserInfos = fp.pick(user, [
    'id',
    'email',
    'firstName',
    'lastName',
    'roles',
    'region',
  ]);

  response.status(constants.HTTP_STATUS_OK).send(userInfos);
};

const findUsers = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = request.query as FindUserOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Find users', findOptions);

  const users = await userRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(users);
};

export default {
  getUserInfos,
  findUsers,
};
