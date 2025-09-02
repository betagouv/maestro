import { errors as compose, ErrorHandler, Next } from 'compose-middleware';
import { Request, Response } from 'express';
import { constants } from 'http2';
import { isClientError, isHttpError } from 'maestro-shared/errors/httpError';

function log(
  error: Error,
  _request: Request,
  _response: Response,
  next: Next
): void {
  // Should later be enhanced with relevant info like Request ID, user ID, etc.
  if (error.name !== 'UnauthorizedError') {
    console.error(error);
  }
  next(error);
}

function respond(
  error: Error,
  _request: Request,
  response: Response,
  next: Next
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  const status =
    isHttpError(error) && isClientError(error) ? error.status : 500;

  response.status(status ?? constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
    name: error.name,
    message: isHttpError(error) ? error.message : 'Internal Server Error'
  });
}

export default function errorHandler(): ErrorHandler<Request, Response> {
  return compose<Request, Response>(log, respond);
}
