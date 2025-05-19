import { constants } from 'http2';
import { HttpError } from './httpError';

export default class SendEmailError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'SendEmailError',
      message: `Can't send the email`,
      status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    });
  }
}
