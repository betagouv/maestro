import { constants } from 'node:http2';
import { HttpError } from './httpError';

export default class SyncContactError extends HttpError implements HttpError {
  constructor(email: string) {
    super({
      name: 'SyncContactError',
      message: `Can't sync the contact ${email}`,
      status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    });
  }
}
