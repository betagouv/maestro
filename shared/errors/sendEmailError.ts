import { HttpError } from './httpError';
import { constants } from 'http2';

export default class SendEmailError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'SendEmailError',
      message: `Can't send the email`,
      status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    });
  }
}
