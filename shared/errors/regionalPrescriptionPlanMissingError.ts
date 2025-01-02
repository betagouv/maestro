import { constants } from 'http2';

import { HttpError } from '../../server/errors/httpError';
import { Region } from '../referential/Region';

export default class RegionalPrescriptionMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string, region: Region) {
    super({
      name: 'RegionalPrescriptionMissingError',
      message: `Prescription ${id} missing for region ${region}`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
