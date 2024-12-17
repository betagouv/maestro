// export const mailService: MailService = serviceByProvider[config.mailer.provider]()

import { createOpenIdClientService } from './openIdClientService';

export const getAuthService = createOpenIdClientService();
