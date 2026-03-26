import { constants } from 'node:http2';

import type { Region } from '../referential/Region';
import { HttpError } from './httpError';

export default class LocalPrescriptionMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string, region: Region) {
    super({
      name: 'LocalPrescriptionMissingError',
      message: `Prescription ${id} missing for region ${region}`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
