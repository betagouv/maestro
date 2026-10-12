import { constants } from 'node:http2';
import { HttpError } from 'maestro-shared/errors/httpError';

export default class RouteNotFoundError extends HttpError implements HttpError {
  constructor(method: string, url: string) {
    super({
      name: 'RouteNotFoundError',
      message: `Route not found: ${method} ${url}`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
