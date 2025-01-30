import { AuthService } from './authService';
import { createOpenIdClientService } from './openIdClientService';

export const getAuthService: Promise<AuthService> = createOpenIdClientService();
