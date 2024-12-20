import express, { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import request from 'supertest';
import errorHandler from '../error-handler'
import { describe, test } from 'vitest';

describe('Error handler', () => {
  describe('Integration test', () => {
    const expectedErrorRoute = '/fail';
    const unexpectedErrorRoute = '/unexpected-fail';
    const app = express();

    app.get(
      unexpectedErrorRoute,
      async (_request: Request, _response: Response, next: NextFunction) => {
        const error = new Error('Unexpected error');
        next(error);
      },
    );
    app.use(errorHandler());

    test('should respond with the status of the error if any', async () => {
      await request(app)
        .get(expectedErrorRoute)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should respond 500 Internal server error otherwise', async () => {
      await request(app)
        .get(unexpectedErrorRoute)
        .expect(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    });
  });
});
