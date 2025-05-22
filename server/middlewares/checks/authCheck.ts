import express, { NextFunction, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

import { constants } from 'http2';
import AuthenticationMissingError from 'maestro-shared/errors/authenticationMissingError';
import UserMissingError from 'maestro-shared/errors/userMissingError';
import UserPermissionMissingError from 'maestro-shared/errors/userPermissionMissingError';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';
import { hasPermission, User } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { userRepository } from '../../repositories/userRepository';
import config from '../../utils/config';

import AuthenticationFailedError from 'maestro-shared/errors/authenticationFailedError';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from '../../utils/constants';

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

const setUser = async (
  request: Request,
  user: User | undefined
): Promise<void> => {
  if (user?.role === 'Administrator') {
    const mascaradeUserId = request.header('X-MASCARADE-ID');
    if (mascaradeUserId !== undefined) {
      const mascaradeUser = await userRepository.findUnique(mascaradeUserId);
      if (mascaradeUser !== undefined) {
        request.user = mascaradeUser;
        return;
      }
    }
  }

  request.user = user;
};

export const userCheck = (credentialsRequired: boolean) =>
  async function (request: Request, _response: Response, next: NextFunction) {
    if (credentialsRequired) {
      if (!request.auth || !request.auth.userId || !request.auth.loggedSecret) {
        throw new AuthenticationMissingError();
      }

      const user = await userRepository.findUnique(request.auth.userId);
      if (!user) {
        throw new UserMissingError(request.auth.userId);
      }

      if (!user.loggedSecrets.includes(request.auth.loggedSecret)) {
        throw new AuthenticationFailedError();
      }

      await setUser(request, user);
    } else {
      if (request.auth && request.auth.userId) {
        await setUser(
          request,
          await userRepository.findUnique(request.auth.userId)
        );
      }
    }
    next();
  };

const roleCheck = (roles: UserRole[]) =>
  async function (request: Request, _response: Response, next: NextFunction) {
    if (!request.user) {
      throw new AuthenticationMissingError();
    }

    if (!roles.includes(request.user.role)) {
      throw new UserRoleMissingError();
    }

    next();
  };

export const permissionsCheck = (permissions: UserPermission[]) =>
  async function (request: Request, _response: Response, next: NextFunction) {
    if (!request.user) {
      throw new AuthenticationMissingError();
    }

    if (!hasPermission(request.user, ...permissions)) {
      throw new UserPermissionMissingError();
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
