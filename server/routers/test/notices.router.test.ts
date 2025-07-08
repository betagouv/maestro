import { constants } from 'http2';
import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { User } from 'maestro-shared/schema/User/User';
import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalObserver
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { noticesRepository } from '../../repositories/noticesRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Notices router', () => {
  const { app } = createServer();

  const testRoute = (type: Notice['type']) => `/api/notices/${type}`;

  describe('GET /notices/:type', () => {
    test('should get a valid type', async () => {
      await request(app)
        .get(testRoute('toto' as Notice['type']))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get notice', async () => {
      const res = await request(app)
        .get(testRoute('root'))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchInlineSnapshot(
        {},
        `
        {
          "description": null,
          "title": null,
          "type": "root",
        }
      `
      );
    });
  });
  describe('PUT /notices/:type', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute('root'))
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(testRoute('root'))
          .send(payload)
          .use(tokenProvider(AdminFixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({});
      await badRequestTest({
        type: undefined
      });
      await badRequestTest({
        type: 'foo'
      });
      await badRequestTest({
        type: 'root',
        title: 1
      });
    });

    test('should fail if the user does not have the permission', async () => {
      const forbiddenRequestTest = async (user: User) =>
        request(app)
          .put(testRoute('root'))
          .send({
            type: 'root',
            title: '',
            description: ''
          })
          .use(tokenProvider(user))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

      await forbiddenRequestTest(RegionalObserver);
      await forbiddenRequestTest(NationalObserver);
      await forbiddenRequestTest(NationalCoordinator);
    });

    test('should update the notice', async () => {
      await request(app)
        .put(testRoute('root'))
        .send({
          type: 'root',
          title: 'title',
          description: 'description'
        })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      await expect(noticesRepository.findByType('root')).resolves
        .toMatchInlineSnapshot;
    });
  });
});
