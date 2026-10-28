import { constants } from 'node:http2';
import { HttpError } from './httpError';

export default class SachaReferentialError
  extends HttpError
  implements HttpError
{
  constructor(message: string) {
    super({
      name: 'SachaReferentialError',
      message,
      status: constants.HTTP_STATUS_BAD_REQUEST
    });
  }
}
