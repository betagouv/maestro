import { constants } from 'http2';

import { HttpError } from './httpError';

export default class AnalysisMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'AnalysisMissingError',
      message: `Analysis ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND,
    });
  }
}
