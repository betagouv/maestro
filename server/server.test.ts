import { constants } from 'node:http2';
import request from 'supertest';
import { describe, expect, test, vi } from 'vitest';
import { createServer } from './server';

vi.mock('./services/authService', () => ({
  getAuthService: Promise.resolve({
    getAuthorizationUrl: vi.fn(() => ({
      url: 'https://fakeUrl.com'
    })),
    authenticate: vi.fn,
    getLogoutUrl: vi.fn
  })
}));

describe('application', () => {
  const { app } = createServer();

  test('les CSP sont présentes', async () => {
    const res = await request(app)
      .get('/api/auth/redirect-url')
      .expect(constants.HTTP_STATUS_OK);

    expect(res.body).toMatchInlineSnapshot(`
      {
        "url": "https://fakeUrl.com",
      }
    `);
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});
