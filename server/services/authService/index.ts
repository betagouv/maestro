import { createOpenIdClientService } from './openIdClientService';
import { AuthService } from './authService';

export const getAuthService: Promise<AuthService> = createOpenIdClientService();
