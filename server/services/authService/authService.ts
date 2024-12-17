import { AuthRedirectUrl } from '../../../shared/schema/Auth/AuthRedirectUrl';

export interface AuthService {
  getAuthorizationUrl(scope: string): AuthRedirectUrl;
  authenticate(authRedirectUrl: AuthRedirectUrl): Promise<{
    idToken: string;
    email: string;
  }>;
  getLogoutUrl(idToken: string): AuthRedirectUrl;
}
