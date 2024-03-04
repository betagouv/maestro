import { Request, Response } from 'express';
import { isClientError, isHttpError } from '../errors/httpError';
import { errors as compose, ErrorHandler, Next } from 'compose-middleware';
import { constants } from 'http2';

function log(
  error: Error,
  request: Request,
  response: Response,
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
  request: Request,
  response: Response,
  // Needed because express bases itself on the number of arguments
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    message: isHttpError(error) ? error.message : 'Internal Server Error',
  });
}

export default function errorHandler(): ErrorHandler<Request, Response> {
  return compose<Request, Response>(log, respond);
}
