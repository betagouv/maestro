import { describe, expect, test, vi } from 'vitest';
import { createServer } from './server';
import request from 'supertest';
import { constants } from 'http2';

vi.mock('./services/authService', () => ({
  getAuthService: Promise.resolve({
    getAuthorizationUrl: vi.fn,
    authenticate: vi.fn,
    getLogoutUrl: vi.fn
  })
}));
describe('application', () => {
  const { app } = createServer();

  test('les CSP sont présentes', async () => {
    const res = await request(app)
      .get('/api/api-docs')
      .expect(constants.HTTP_STATUS_OK)

    expect(res.headers['content-security-policy']).toBeDefined()
  })
})