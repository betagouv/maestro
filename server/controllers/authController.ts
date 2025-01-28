import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import AuthenticationFailedError from '../../shared/errors/authenticationFailedError';
import { AuthRedirectUrl } from '../../shared/schema/Auth/AuthRedirectUrl';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import { userRepository } from '../repositories/userRepository';
import { getAuthService } from '../services/authService';
import config from '../utils/config';
import { AuthMaybeUnknownUser } from '../../shared/schema/User/AuthUser';

const getAuthRedirectUrl = async (request: Request, response: Response) => {
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
    const { idToken, email, firstName, lastName } = await authService.authenticate(authRedirectUrl);

    const user = await userRepository.findOne(email);
    if (user && (user.firstName !== firstName || user.lastName !== lastName)) {
      await userRepository.updateNames({email, firstName, lastName})
    }

    const tokenPayload: TokenPayload = {
      userId: user?.id ?? null,
      idToken
    }
    const accessToken = jwt.sign(tokenPayload,
      config.auth.secret,
      { expiresIn: config.auth.expiresIn }
    );

    const result: AuthMaybeUnknownUser = user !== undefined ? {
      userId: user.id,
      accessToken
    } : {
      userId: null,
      userEmail: email,
      accessToken
    }

    return response.status(constants.HTTP_STATUS_OK).json(result);
  } catch (error) {
    console.error('Error while authenticating', error);
    throw new AuthenticationFailedError();
  }
};

const logout = async (request: Request, response: Response) => {
  const { idToken } = (request as AuthenticatedRequest).auth;
  const authService = await getAuthService;

  const logoutUrl = authService.getLogoutUrl(idToken);

  return response.status(constants.HTTP_STATUS_OK).json(logoutUrl);
};

export default {
  getAuthRedirectUrl,
  authenticate,
  logout
};
