import { constants } from 'http2';
import { HttpError } from './httpError';

export default class BadRequestError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'BadRequestError',
      message: `Bad Request`,
      status: constants.HTTP_STATUS_BAD_REQUEST
    });
  }
}
