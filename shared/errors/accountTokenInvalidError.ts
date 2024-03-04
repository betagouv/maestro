import { constants } from 'http2';
import { HttpError } from '../../server/errors/httpError';

export default class AccountTokenInvalidError
  extends HttpError
  implements HttpError
{
  constructor() {
    super({
      name: 'SignupLinkInvalidError',
      message: `Signup link missing or expired or already used`,
      status: constants.HTTP_STATUS_UNAUTHORIZED,
    });
  }
}
