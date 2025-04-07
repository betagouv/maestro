import { fakerFR } from '@faker-js/faker';
import { AuthRedirectUrl } from '../schema/Auth/AuthRedirectUrl';

export const genAuthRedirectUrl = (
  data?: Partial<AuthRedirectUrl>
): AuthRedirectUrl => ({
  url: fakerFR.internet.url(),
  nonce: fakerFR.string.alphanumeric(32),
  state: fakerFR.string.alphanumeric(32),
  ...data
});
