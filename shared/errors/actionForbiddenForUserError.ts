import { constants } from 'http2';

import { HttpError } from './httpError';

export default class ActionForbiddenForUserError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'ActionForbiddenForUserError',
      message: `Action forbidden for user ${id}`,
      status: constants.HTTP_STATUS_FORBIDDEN,
    });
  }
}
