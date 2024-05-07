import { NextFunction, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

import _ from 'lodash';
import AuthenticationMissingError from '../../../shared/errors/authenticationMissingError';
import UserMissingError from '../../../shared/errors/userMissingError';
import UserPermissionMissingError from '../../../shared/errors/userPermissionMissingError';
import UserRoleMissingError from '../../../shared/errors/userRoleMissingError';
import { hasPermission } from '../../../shared/schema/User/User';
import { UserPermission } from '../../../shared/schema/User/UserPermission';
import { UserRole } from '../../../shared/schema/User/UserRole';
import userRepository from '../../repositories/userRepository';
import config from '../../utils/config';

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

      const user = await userRepository.findUnique(request.auth.userId);
      if (!user) {
        throw new UserMissingError(request.auth.userId);
      }

      request.user = user;
    } else {
      if (request.auth) {
        request.user =
          (await userRepository.findUnique(request.auth.userId)) ?? undefined;
      }
    }
    next();
  };

export const rolesCheck = (roles: UserRole[]) =>
  async function (request: Request, _response: Response, next: NextFunction) {
    if (!request.user) {
      throw new AuthenticationMissingError();
    }

    if (_.intersection(roles, request.user.roles).length === 0) {
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
