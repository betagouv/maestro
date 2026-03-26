import { decode } from 'jsonwebtoken';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { AuthRedirectUrl } from 'maestro-shared/schema/Auth/AuthRedirectUrl';
import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  buildEndSessionUrl,
  ClientSecretPost,
  type Configuration,
  discovery,
  fetchUserInfo,
  randomNonce,
  randomState
} from 'openid-client';
import config from '../../utils/config';
import type { AuthService } from './authService';

const loginCallbackUrl = `${config.application.host}${AppRouteLinks.LoginCallbackRoute.link}`;
const logoutCallbackUrl = `${config.application.host}${AppRouteLinks.LogoutCallbackRoute.link}`;

class OpenIdClientService implements AuthService {
  private readonly client: Configuration;

  private constructor(client: Configuration) {
    this.client = client;
  }

  static create = async () => {
    if (
      !config.auth.providerUrl ||
      !config.auth.clientId ||
      !config.auth.clientSecret
    ) {
      throw new Error(
        'Missing providerUrl, clientId or clientSecret in the config'
      );
    }

    const client = await discovery(
      new URL(config.auth.providerUrl),
      config.auth.clientId,
      {
        redirect_uris: [loginCallbackUrl],
        response_types: ['code'],
        id_token_signed_response_alg: config.auth.tokenAlgorithm,
        userinfo_signed_response_alg: config.auth.userInfoAlgorithm ?? undefined
      },
      ClientSecretPost(config.auth.clientSecret)
    );

    return new OpenIdClientService(client);
  };

  getAuthorizationUrl = (scope: string) => {
    const nonce = randomNonce();
    const state = randomState();

    const authorizationUrl = buildAuthorizationUrl(this.client, {
      scope,
      state,
      nonce,
      redirect_uri: loginCallbackUrl
    });

    return {
      url: authorizationUrl.href,
      state,
      nonce
    };
  };

  authenticate = async (
    authRedirectUrl: AuthRedirectUrl
  ): Promise<{ idToken: string; name: string; email: string }> => {
    const tokenSet = await authorizationCodeGrant(
      this.client,
      new URL(authRedirectUrl.url),
      {
        expectedState: authRedirectUrl.state ?? '',
        expectedNonce: authRedirectUrl.nonce ?? ''
      }
    );

    if (!tokenSet.access_token) {
      throw new Error('No access token received');
    }

    const expiresIn = tokenSet.expiresIn();
    if (expiresIn !== undefined && expiresIn <= 0) {
      throw new Error('Token expired');
    }

    const idToken = tokenSet.id_token as string;

    const decodedToken = decode(idToken, { complete: true });

    if (!decodedToken || typeof decodedToken.payload === 'string') {
      throw new Error('Invalid token');
    }

    if (decodedToken.header.alg !== config.auth.tokenAlgorithm) {
      throw new Error('Invalid algorithm');
    }

    if (decodedToken.payload.nonce !== authRedirectUrl.nonce) {
      throw new Error('Invalid nonce');
    }

    const subject = tokenSet.claims()?.sub;
    if (!subject) {
      throw new Error('No subject found in token claims');
    }

    const userInfo = await fetchUserInfo(
      this.client,
      tokenSet.access_token,
      subject
    );

    if (!userInfo.email) {
      throw new Error('No email found in user info');
    }

    const name: string =
      userInfo.name ??
      `${userInfo.given_name ?? ''} ${userInfo.usual_name ?? ''}`;

    return {
      idToken,
      email: userInfo.email,
      name
    };
  };

  getLogoutUrl = (idToken: string) => {
    const state = randomState();

    const logoutUrl = buildEndSessionUrl(this.client, {
      id_token_hint: idToken,
      state,
      post_logout_redirect_uri: logoutCallbackUrl
    });

    return {
      url: logoutUrl.href,
      state
    };
  };
}
export const createOpenIdClientService = async () => {
  return OpenIdClientService.create();
};
