import express, { NextFunction, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

import { constants } from 'http2';
import AuthenticationMissingError from 'maestro-shared/errors/authenticationMissingError';
import UserMissingError from 'maestro-shared/errors/userMissingError';
import { User } from 'maestro-shared/schema/User/User';
import { userRepository } from '../../repositories/userRepository';
import config from '../../utils/config';

import {
  COOKIE_MAESTRO_ACCESS_TOKEN,
  COOKIE_MAESTRO_MASCARADE,
  COOKIE_MAESTRO_USER_ROLE
} from 'maestro-shared/constants';
import AuthenticationFailedError from 'maestro-shared/errors/authenticationFailedError';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';

export const jwtCheck = (credentialsRequired: boolean) =>
  expressjwt({
    secret: config.auth.secret,
    algorithms: ['HS256'],
    credentialsRequired,
    getToken: (request: Request) => {
      return request.cookies?.[COOKIE_MAESTRO_ACCESS_TOKEN] as string;
    },
    ignoreExpiration: !credentialsRequired
  });

export const getUser = async (
  cookies: Record<string, string> | undefined,
  user: User
): Promise<User> => {
  if (user.roles.includes('Administrator')) {
    const mascaradeUserId = cookies?.[COOKIE_MAESTRO_MASCARADE];
    if (mascaradeUserId !== undefined) {
      const mascaradeUser = await userRepository.findUnique(mascaradeUserId);
      if (mascaradeUser !== undefined) {
        return mascaradeUser;
      }
    }
  }

  return user;
};

export const userCheck = (credentialsRequired: boolean) =>
  async function (request: Request, _response: Response, next: NextFunction) {
    if (credentialsRequired) {
      if (!request.auth || !request.auth.userId || !request.auth.loggedSecret) {
        throw new AuthenticationMissingError(request.auth);
      }

      const user = await userRepository.findUnique(request.auth.userId);
      if (!user) {
        throw new UserMissingError(request.auth.userId);
      }

      if (!user.loggedSecrets.includes(request.auth.loggedSecret)) {
        throw new AuthenticationFailedError();
      }

      if (user.disabled) {
        throw new AuthenticationFailedError();
      }

      const requestUser = await getUser(request.cookies, user);
      if (request.userRole && !requestUser.roles.includes(request.userRole)) {
        throw new UserRoleMissingError();
      }

      request.user = requestUser;
    } else {
      if (request.auth && request.auth.userId) {
        const user = await userRepository.findUnique(request.auth.userId);
        if (user) {
          request.user = await getUser(request.cookies, user);
        }
      }
    }
    if (request.user) {
      if (
        request.cookies?.[COOKIE_MAESTRO_USER_ROLE] &&
        request.user.roles.includes(request.cookies?.[COOKIE_MAESTRO_USER_ROLE])
      ) {
        request.userRole = request.cookies?.[COOKIE_MAESTRO_USER_ROLE];
      } else {
        request.userRole = request.user.roles[0];
      }
    }
    next();
  };

export const basicAuthCheck = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (token !== config.m2mBasicToken) {
      res.status(constants.HTTP_STATUS_UNAUTHORIZED);
      res.send('Authentication Required');

      return;
    }
  } catch (e) {
    console.error(e);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    res.send('Internal error');

    return;
  }

  next();
};
