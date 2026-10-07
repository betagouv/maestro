import { constants } from 'node:http2';
import type { ErrorRequestHandler } from 'express';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from 'maestro-shared/constants';
import AuthenticationFailedError from 'maestro-shared/errors/authenticationFailedError';
import AuthenticationMissingError from 'maestro-shared/errors/authenticationMissingError';
import { isClientError, isHttpError } from 'maestro-shared/errors/httpError';

export default function errorHandler(): ErrorRequestHandler {
  return (error: Error, _request, response, next) => {
    if (error.name !== 'UnauthorizedError') {
      console.error(error);
    }

    if (
      error instanceof AuthenticationMissingError ||
      error instanceof AuthenticationFailedError
    ) {
      response.clearCookie(COOKIE_MAESTRO_ACCESS_TOKEN);
    }

    if (response.headersSent) {
      next(error);
      return;
    }

    const status =
      isHttpError(error) && isClientError(error) ? error.status : 500;

    response
      .status(status ?? constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json({
        name: error.name,
        message: error.message ?? 'Internal Server Error'
      });
  };
}
