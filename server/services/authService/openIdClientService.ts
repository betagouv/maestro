import { decode } from 'jsonwebtoken';
import { generators, Issuer } from 'openid-client';
import { AuthRedirectUrl } from 'maestro-shared/schema/Auth/AuthRedirectUrl';
import { User } from 'maestro-shared/schema/User/User';
import config from '../../utils/config';
import { AuthService } from './authService';

const loginCallbackUrl = `${config.application.host}/login-callback`;
const logoutCallbackUrl = `${config.application.host}/logout-callback`;

class OpenIdClientService implements AuthService {
  private client: any;

  private constructor(client: any) {
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

    const issuer = await Issuer.discover(config.auth.providerUrl);

    const client = new issuer.Client({
      client_id: config.auth.clientId,
      client_secret: config.auth.clientSecret,
      redirect_uris: [loginCallbackUrl],
      response_types: ['code'],
      id_token_signed_response_alg: config.auth.tokenAlgorithm,
      userinfo_signed_response_alg: config.auth.tokenAlgorithm
    });

    return new OpenIdClientService(client);
  };

  getAuthorizationUrl = (scope: string) => {
    const nonce = generators.nonce();
    const state = generators.state();

    const authorizationUrl = this.client.authorizationUrl({
      scope,
      state,
      nonce
    });

    return {
      url: authorizationUrl,
      state,
      nonce
    };
  };

  authenticate = async (
    authRedirectUrl: AuthRedirectUrl
  ): Promise<
    { idToken: string } & Pick<User, 'email' | 'firstName' | 'lastName'>
  > => {
    const params = this.client.callbackParams(authRedirectUrl.url);
    const tokenSet = await this.client.callback(loginCallbackUrl, params, {
      state: authRedirectUrl.state ?? '',
      nonce: authRedirectUrl.nonce ?? ''
    });

    if (!tokenSet.access_token) {
      throw new Error('No access token received');
    }

    if (tokenSet.expires_at && Date.now() > tokenSet.expires_at * 1000) {
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

    const userInfo = await this.client.userinfo(
      tokenSet.access_token as string
    );

    if (!userInfo.email) {
      throw new Error('No email found in user info');
    }

    return {
      idToken,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.usual_name
    };
  };

  getLogoutUrl = (idToken: string) => {
    const state = generators.state();

    const logoutUrl = this.client.endSessionUrl({
      id_token_hint: idToken,
      state,
      post_logout_redirect_uri: logoutCallbackUrl
    });

    return {
      url: logoutUrl,
      state
    };
  };
}
export const createOpenIdClientService = async () => {
  return OpenIdClientService.create();
};
