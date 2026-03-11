import { constants } from 'node:http2';

import { HttpError } from './httpError';

export default class SampleItemMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string, itemNumber: number, copyNumber: number) {
    super({
      name: 'SampleItemMissingError',
      message: `Sample item ${id} - item number ${itemNumber} - copy number ${copyNumber} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
