import { constants } from 'http2';
import { HttpError } from 'maestro-shared/errors/httpError';

export default class RouteNotFoundError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'RouteNotFoundError',
      message: `Route not found`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
