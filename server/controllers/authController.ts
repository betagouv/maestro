import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import jwt, { decode } from 'jsonwebtoken';
import { generators, Issuer } from 'openid-client';
import AuthenticationFailedError from '../../shared/errors/authenticationFailedError';
import { AuthRedirectUrl } from '../../shared/schema/Auth/AuthRedirectUrl';
import { SignIn } from '../../shared/schema/SignIn';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import userRepository from '../repositories/userRepository';
import config from '../utils/config';

const signIn = async (request: Request, response: Response) => {
  const { email, password } = request.body as SignIn;

  const user = await userRepository.findOne(email);
  if (!user || !user.password) {
    throw new AuthenticationFailedError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationFailedError();
  }

  const accessToken = jwt.sign(
    {
      userId: user.id
    } as TokenPayload,
    config.auth.secret,
    { expiresIn: config.auth.expiresIn }
  );

  return response.status(constants.HTTP_STATUS_OK).json({
    userId: user.id,
    accessToken,
    userRoles: user.roles
  });
};

const getAuthProviderConfig = async () => {
  if (
    !config.auth.providerUrl ||
    !config.auth.clientId ||
    !config.auth.clientSecret
  ) {
    throw new Error(
      'Missing providerUrl, clientId or clientSecret in the config'
    );
  }

  const issuer = await Issuer.discover(config.auth.providerUrl);

  return new issuer.Client({
    client_id: config.auth.clientId,
    client_secret: config.auth.clientSecret,
    redirect_uris: config.auth.loginCallbackUrl
      ? [config.auth.loginCallbackUrl]
      : [],
    response_types: ['code'],
    id_token_signed_response_alg: config.auth.tokenAlgorithm,
    userinfo_signed_response_alg: config.auth.tokenAlgorithm
  });
};

const getAuthRedirectUrl = async (request: Request, response: Response) => {
  const client = await getAuthProviderConfig();

  const nonce = generators.nonce();
  const state = generators.state();

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid profile email',
    state,
    nonce,
    acr_values: 'eidas1'
  });

  const authRedirectUrl = {
    url: authorizationUrl,
    state,
    nonce
  };

  response.status(200).send(authRedirectUrl);
};

const authenticate = async (request: Request, response: Response) => {
  const authRedirectUrl = request.body as AuthRedirectUrl;
  const client = await getAuthProviderConfig();

  console.log('authenticate', authRedirectUrl);

  const params = client.callbackParams(authRedirectUrl.url);
  const tokenSet = await client.callback(
    config.auth.loginCallbackUrl as string,
    params,
    {
      state: authRedirectUrl.state,
      nonce: authRedirectUrl.nonce
    }
  );

  if (!tokenSet.access_token) {
    throw new Error('No access token received');
  }

  if (tokenSet.expires_at && Date.now() > tokenSet.expires_at * 1000) {
    throw new Error('Access token has expired');
  }

  const idToken = tokenSet.id_token as string;
  const decodedToken = decode(idToken, { complete: true });

  if (!decodedToken || typeof decodedToken.payload === 'string') {
    throw new Error('Invalid ID token');
  }

  if (decodedToken.header.alg !== config.auth.tokenAlgorithm) {
    throw new Error('Invalid token algorithm');
  }

  if (decodedToken.payload.nonce !== authRedirectUrl.nonce) {
    throw new Error('Invalid nonce');
  }

  const userInfo = await client.userinfo(tokenSet.access_token as string);

  if (!userInfo.email) {
    throw new Error('No email found in user info');
  }

  const user = await userRepository.findOne(userInfo.email);

  if (!user) {
    throw new AuthenticationFailedError();
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      idToken
    } as TokenPayload,
    config.auth.secret,
    { expiresIn: config.auth.expiresIn }
  );

  return response.status(constants.HTTP_STATUS_OK).json({
    userId: user.id,
    accessToken,
    userRoles: user.roles
  });
};

const logout = async (request: Request, response: Response) => {
  const { idToken } = (request as AuthenticatedRequest).auth;
  const client = await getAuthProviderConfig();

  const state = generators.state();

  const logoutUrl = client.endSessionUrl({
    id_token_hint: idToken,
    state,
    post_logout_redirect_uri: config.auth.logoutCallbackUrl as string
  });

  return response.status(constants.HTTP_STATUS_OK).json({
    url: logoutUrl,
    state
  });
};

export default {
  signIn,
  getAuthRedirectUrl,
  authenticate,
  logout
};
