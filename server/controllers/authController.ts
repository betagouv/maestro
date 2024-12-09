import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import client from 'openid-client';
import AuthenticationFailedError from '../../shared/errors/authenticationFailedError';
import { SignIn } from '../../shared/schema/SignIn';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import { objToUrlParams } from '../../shared/utils/utils';
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

const getAuthProviderConfig = () => {
  if (
    !config.auth.providerUrl ||
    !config.auth.clientId ||
    !config.auth.clientSecret
  ) {
    throw new Error(
      'Missing providerUrl, clientId or clientSecret in the config'
    );
  }

  return client.discovery(
    new URL(config.auth.providerUrl) as URL,
    config.auth.clientId,
    {
      id_token_signed_response_alg: 'RS256',
      userinfo_signed_response_alg: 'RS256'
    },
    client.ClientSecretPost(config.auth.clientSecret)
  );
};

const getAuthRedirectUrl = async (request: Request, response: Response) => {
  const config = await getAuthProviderConfig();
  const nonce = client.randomNonce();
  const state = client.randomState();

  const authRedirectUrl = {
    url: client.buildAuthorizationUrl(
      config,
      objToUrlParams({
        nonce,
        state,
        redirect_uri: `http://localhost:3000/login`,
        scope: 'openid profile',
        acr_values: 'eidas1',
        claims: {
          id_token: {
            email: {
              essential: true
            }
          }
        }
      }) as URLSearchParams
    ),
    state,
    nonce
  };

  response.status(200).send(authRedirectUrl);
};

export default {
  signIn,
  getAuthRedirectUrl
};
