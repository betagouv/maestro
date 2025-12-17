import { constants } from 'http2';
import { HttpError } from './httpError';

export default class AuthenticationMissingError
  extends HttpError
  implements HttpError
{
  constructor(auth: unknown) {
    super({
      name: 'AuthenticationMissingError',
      message: `Authentication missing ${auth}`,
      status: constants.HTTP_STATUS_UNAUTHORIZED
    });
  }
}
