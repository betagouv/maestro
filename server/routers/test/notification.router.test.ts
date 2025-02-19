import { constants } from 'http2';
import { genNotification } from 'maestro-shared/test/notificationFixtures';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { withISOStringDates } from 'maestro-shared/utils/utils';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  formatNotification,
  Notifications
} from '../../repositories/notificationRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Notification router', () => {
  const { app } = createServer();

  const notification1 = genNotification({
    recipientId: Sampler1Fixture.id,
    author: RegionalCoordinator,
    read: false
  });
  const notification2 = genNotification({
    recipientId: Sampler1Fixture.id,
    author: NationalCoordinator,
    read: false
  });
  const notification3 = genNotification({
    recipientId: NationalCoordinator.id
  });

  beforeAll(async () => {
    await Notifications().insert(
      [notification1, notification2, notification3].map(formatNotification)
    );
  });

  afterAll(async () => {
    await Notifications()
      .delete()
      .whereIn('id', [notification1.id, notification2.id, notification3.id]);
  });

  describe('GET /notifications', () => {
    const testRoute = '/api/notifications';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid query', async () => {
      await request(app)
        .get(testRoute)
        .query({ recipientId: undefined })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should find the notification related to the user', async () => {
      const res1 = await request(app)
        .get(testRoute)
        .query({ recipientId: Sampler1Fixture.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res1.body).toEqual([
        withISOStringDates(notification1),
        withISOStringDates(notification2)
      ]);

      const res2 = await request(app)
        .get(testRoute)
        .query({ recipientId: NationalCoordinator.id })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res2.body).toEqual([withISOStringDates(notification3)]);
    });
  });

  describe('PUT /notifications/:notificationId', () => {
    const testRoute = (notificationId: string) =>
      `/api/notifications/${notificationId}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(notification1.id))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid notification id', async () => {
      await request(app)
        .put(testRoute('invalid-id'))
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the notification does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user is not the recipient of the notification', async () => {
      await request(app)
        .put(testRoute(notification3.id))
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should update the notification', async () => {
      const res = await request(app)
        .put(testRoute(notification1.id))
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        withISOStringDates({ ...notification1, read: true })
      );
    });
  });

  describe('PUT /notifications', () => {
    const testRoute = '/api/notifications';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute)
        .query({ recipientId: Sampler1Fixture.id })
        .send({ read: true })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid body', async () => {
      await request(app)
        .put(testRoute)
        .query({ recipientId: Sampler1Fixture.id })
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should get a valid query', async () => {
      await request(app)
        .put(testRoute)
        .query({ recipientId: undefined })
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update the notifications related to the user', async () => {
      const res = await request(app)
        .put(testRoute)
        .query({ recipientId: Sampler1Fixture.id })
        .use(tokenProvider(Sampler1Fixture))
        .send({ read: true })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining([
          withISOStringDates({ ...notification1, read: true }),
          withISOStringDates({ ...notification2, read: true })
        ])
      );
    });
  });
});
