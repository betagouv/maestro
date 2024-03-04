import { NextFunction, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

import AuthenticationMissingError from '../../shared/errors/authenticationMissingError';
import UserMissingError from '../../shared/errors/userMissingError';
import userRepository from '../repositories/userRepository';
import config from '../utils/config';

export const jwtCheck = (credentialsRequired: boolean) =>
  expressjwt({
    secret: config.auth.secret,
    algorithms: ['HS256'],
    credentialsRequired,
    getToken: (request: Request) =>
      (request.headers['x-access-token'] ??
        request.query['x-access-token']) as string,
  });

export const userCheck = (credentialsRequired: boolean) =>
  async function (request: Request, response: Response, next: NextFunction) {
    if (credentialsRequired) {
      if (!request.auth || !request.auth.userId) {
        throw new AuthenticationMissingError();
      }

      const user = await userRepository.get(request.auth.userId);
      if (!user) {
        throw new UserMissingError(request.auth.userId);
      }

      request.user = user;
    } else {
      if (request.auth) {
        request.user =
          (await userRepository.get(request.auth.userId)) ?? undefined;
      }
    }
    next();
  };
