import { constants } from 'http2';
import { HttpError } from './httpError';

export default class NoRegionError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'NoRegionError',
      message: `Vous êtes rattaché à aucune région`,
      status: constants.HTTP_STATUS_FORBIDDEN
    });
  }
}
