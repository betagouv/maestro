import { AuthRedirectUrl } from 'maestro-shared/schema/Auth/AuthRedirectUrl';

export interface AuthService {
  getAuthorizationUrl(scope: string): AuthRedirectUrl;
  authenticate(authRedirectUrl: AuthRedirectUrl): Promise<{
    idToken: string;
    email: string;
    firstName: string;
    lastName: string
  }>;
  getLogoutUrl(idToken: string): AuthRedirectUrl;
}
