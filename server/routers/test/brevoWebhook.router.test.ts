import { constants } from 'node:http2';
import request from 'supertest';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createServer } from '../../server';
import { mockMattermostSend } from '../../test/setupTests';

describe('Brevo webhook router', () => {
  const { app } = createServer();
  const testRoute = '/api/brevo';
  const webhookToken = 'eventApiKey';

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should fail with 401 when the secret header is missing', async () => {
    await request(app)
      .post(testRoute)
      .send({ event: 'hard_bounce', email: 'labo@example.com' })
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(mockMattermostSend).not.toHaveBeenCalled();
  });

  test('should fail with 401 when the secret header is wrong', async () => {
    await request(app)
      .post(testRoute)
      .set('Authorization', 'wrong')
      .send({ event: 'hard_bounce', email: 'labo@example.com' })
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(mockMattermostSend).not.toHaveBeenCalled();
  });

  test('should send a Mattermost notification for any received event', async () => {
    await request(app)
      .post(testRoute)
      .set('Authorization', webhookToken)
      .send({
        event: 'hard_bounce',
        email: 'labo@example.com',
        reason: 'mailbox not found'
      })
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    expect(mockMattermostSend).toHaveBeenCalledTimes(1);
    expect(mockMattermostSend.mock.calls[0][0]).toContain('hard_bounce');
    expect(mockMattermostSend.mock.calls[0][0]).toContain('labo@example.com');
  });

  test('should return 400 on an unreadable payload', async () => {
    await request(app)
      .post(testRoute)
      .set('Authorization', webhookToken)
      .send({ foo: 'bar' })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);
    expect(mockMattermostSend).not.toHaveBeenCalled();
  });
});
