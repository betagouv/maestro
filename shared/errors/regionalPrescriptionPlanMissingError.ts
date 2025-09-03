import { constants } from 'http2';

import { HttpError } from './httpError';

export default class RegionalPrescriptionMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'RegionalPrescriptionMissingError',
      message: `Regional prescription ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
