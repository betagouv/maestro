import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { AuthRedirectUrl } from '../schema/Auth/AuthRedirectUrl';

export const genAuthRedirectUrl = (
  data?: Partial<AuthRedirectUrl>
): AuthRedirectUrl => ({
  url: fakerFR.internet.url(),
  nonce: randomstring.generate(),
  state: randomstring.generate(),
  ...data
});
