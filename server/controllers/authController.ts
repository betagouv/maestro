import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
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

  const client = new issuer.Client({
    client_id: config.auth.clientId,
    client_secret: config.auth.clientSecret,
    redirect_uris: config.auth.callbackUrl ? [config.auth.callbackUrl] : [],
    response_types: ['code'],
    id_token_signed_response_alg: 'RS256',
    userinfo_signed_response_alg: 'RS256'
  });

  return client;
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
    config.auth.callbackUrl as string,
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

  if (decodedToken.header.alg !== 'RS256') {
    //TODO constante
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

export default {
  signIn,
  getAuthRedirectUrl,
  authenticate
};
