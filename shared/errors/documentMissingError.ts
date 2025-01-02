import { constants } from 'http2';

import { HttpError } from '../../server/errors/httpError';

export default class DocumentMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'DocumentMissingError',
      message: `Document ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
