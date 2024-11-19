import { constants } from 'http2';

import { HttpError } from '../../server/errors/httpError';

export default class RegionalPrescriptionMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'RegionalPrescriptionMissingError',
      message: `RegionalPrescription ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND,
    });
  }
}
