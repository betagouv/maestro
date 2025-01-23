import { constants } from 'http2';
import { HttpError } from './httpError';

export default class UserPermissionMissingError
  extends HttpError
  implements HttpError
{
  constructor() {
    super({
      name: 'UserPermissionMissingError',
      message: `User permission missing`,
      status: constants.HTTP_STATUS_FORBIDDEN,
    });
  }
}
