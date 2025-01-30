import { constants } from 'http2';

import { HttpError } from './httpError';

export default class PrescriptionMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'PrescriptionMissingError',
      message: `Prescription ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND,
    });
  }
}
