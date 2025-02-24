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

const getAuthRedirectUrl = async (_request: Request, response: Response) => {
  const authService = await getAuthService;
  //Prénom given_name
  //Nom usual_name
  const authRedirectUrl = authService.getAuthorizationUrl(
    'openid profile email given_name usual_name'
  );

  response.status(200).send(authRedirectUrl);
};

export const COOKIE_MAESTRO_ACCESS_TOKEN = "maestroAccessToken"
const authenticate = async (request: Request, response: Response) => {
  const authRedirectUrl = request.body as AuthRedirectUrl;
  const authService = await getAuthService;

  console.log('authenticate', authRedirectUrl);

  try {
    const { idToken, email, firstName, lastName } =
      await authService.authenticate(authRedirectUrl);

    const user = await userRepository.findOne(email);
    if (user && (user.firstName !== firstName || user.lastName !== lastName)) {
      await userRepository.updateNames({ email, firstName, lastName });
    }

    const tokenPayload: TokenPayload = {
      userId: user?.id ?? null,
      idToken
    };
    const accessToken = jwt.sign(tokenPayload, config.auth.secret, {
      expiresIn: config.auth.expiresIn
    });

    const result: AuthMaybeUnknownUser =
      user !== undefined
        ? {
            user,
          }
        : {
            user: null,
            userEmail: email,
          };

    return response.cookie(COOKIE_MAESTRO_ACCESS_TOKEN, accessToken, {httpOnly: true, secure: config.environment === 'production'}).status(constants.HTTP_STATUS_OK).json(result);
  } catch (error) {
    console.error('Error while authenticating', error);
    throw new AuthenticationFailedError();
  }
};

const logout = async (request: Request, response: Response) => {
  const { idToken } = (request as AuthenticatedRequest).auth;
  const authService = await getAuthService;

  const logoutUrl = authService.getLogoutUrl(idToken);

  response.clearCookie(COOKIE_MAESTRO_ACCESS_TOKEN)

  return response.status(constants.HTTP_STATUS_OK).json(logoutUrl);
};

export default {
  getAuthRedirectUrl,
  authenticate,
  logout
};
