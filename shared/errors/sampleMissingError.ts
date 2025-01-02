import { constants } from 'http2';

import { HttpError } from '../../server/errors/httpError';

export default class SampleMissingError extends HttpError implements HttpError {
  constructor(id: string) {
    super({
      name: 'SampleMissingError',
      message: `Sample ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
