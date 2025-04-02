import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import AuthenticationFailedError from 'maestro-shared/errors/authenticationFailedError';
import { AuthRedirectUrl } from 'maestro-shared/schema/Auth/AuthRedirectUrl';
import { AuthMaybeUnknownUser } from 'maestro-shared/schema/User/AuthUser';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { userRepository } from '../repositories/userRepository';
import { getAuthService } from '../services/authService';
import config from '../utils/config';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

const getAuthRedirectUrl = async (_request: Request, response: Response) => {
  const authService = await getAuthService;
  //Prénom given_name
  //Nom usual_name
  const authRedirectUrl = authService.getAuthorizationUrl(
    'openid profile email given_name usual_name'
  );

  response.status(200).send(authRedirectUrl);
};

const authenticate = async (request: Request, response: Response) => {
  const authRedirectUrl = request.body as AuthRedirectUrl;
  const authService = await getAuthService;

  console.log('authenticate', authRedirectUrl);

  try {
    const { idToken, email, firstName, lastName } =
      await authService.authenticate(authRedirectUrl);

    const user = await userRepository.findOne(email);
    if (user && (user.firstName !== firstName || user.lastName !== lastName)) {
      await userRepository.update({ firstName, lastName }, user.id);
    }

    const loggedSecret = uuidv4()
    const tokenPayload: TokenPayload = {
      userId: user?.id ?? null,
      loggedSecret: user?.id ? loggedSecret : null,
      idToken
    };
    const accessToken = jwt.sign(tokenPayload, config.auth.secret, {
      expiresIn: config.auth.expiresIn
    });
    if (user) {
      await userRepository.addLoggedSecret(loggedSecret, user.id);
    }
    const result: AuthMaybeUnknownUser =
      user !== undefined
        ? {
            user
          }
        : {
            user: null,
            userEmail: email
          };

    return response
      .cookie(COOKIE_MAESTRO_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: config.environment === 'production'
      })
      .status(constants.HTTP_STATUS_OK)
      .json(result);
  } catch (error) {
    console.error('Error while authenticating', error);
    throw new AuthenticationFailedError();
  }
};

const logout = async (request: Request, response: Response) => {
  const { idToken, userId, loggedSecret } = (request as AuthenticatedRequest).auth;
  const authService = await getAuthService;

  const logoutUrl = authService.getLogoutUrl(idToken);

  response.clearCookie(COOKIE_MAESTRO_ACCESS_TOKEN);

  if (userId && loggedSecret) {
    await userRepository.deleteLoggedSecret(loggedSecret, userId);
  }

  return response.status(constants.HTTP_STATUS_OK).json(logoutUrl);
};

export default {
  getAuthRedirectUrl,
  authenticate,
  logout
};
