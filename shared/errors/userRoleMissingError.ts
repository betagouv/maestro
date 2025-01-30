import { constants } from 'http2';
import { HttpError } from './httpError';

export default class UserRoleMissingError
  extends HttpError
  implements HttpError
{
  constructor() {
    super({
      name: 'UserRoleMissingError',
      message: `User role missing`,
      status: constants.HTTP_STATUS_FORBIDDEN,
    });
  }
}
