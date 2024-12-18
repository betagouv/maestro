import express from 'express';
import { constants } from 'http2';
import request from 'supertest';
import { describe, test } from 'vitest';
import config from '../../utils/config';
import { basicAuthCheck } from '../checks/authCheck';

describe('basicAuth', () => {
  const app = express();

  const myM2MRoute = '/basic-auth-route';
  app.use(myM2MRoute, basicAuthCheck, (_request, response) =>
    response.sendStatus(constants.HTTP_STATUS_OK)
  );

  test('should respond with the status 200 with good basic token', async () => {
    await request(app)
      .get(myM2MRoute)
      .set('authorization', config.m2mBasicToken)
      .expect(constants.HTTP_STATUS_OK);
  });

  test('should respond with the status 401 with wrong basic token', async () => {
    await request(app)
      .get(myM2MRoute)
      .set('authorization', 'pas bon token')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
  test('should respond with the status 401 with no basic token', async () => {
    await request(app)
      .get(myM2MRoute)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
});
