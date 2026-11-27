import { constants } from 'node:http2';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createServer } from '../../server';
import config from '../../utils/config';

vi.mock('../../services/ediSacha/sftpService', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return { ...actual, exchangeWithSachaSftp: vi.fn() };
});

const { exchangeWithSachaSftp } = await import(
  '../../services/ediSacha/sftpService'
);

describe('SACHA SFTP exchange router', () => {
  const { app } = createServer();
  const testRoute = '/api/m2m/sachaSftpExchange';

  beforeEach(() => {
    vi.mocked(exchangeWithSachaSftp).mockReset();
    config.sigal.sftp.exchangeEnabled = true;
  });

  afterEach(() => {
    config.sigal.sftp.exchangeEnabled = false;
  });

  test('401 sans jeton', async () => {
    await request(app)
      .get(testRoute)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);

    expect(exchangeWithSachaSftp).not.toHaveBeenCalled();
  });

  test('lance le cycle d’échange', async () => {
    await request(app)
      .get(testRoute)
      .set('authorization', config.m2mBasicToken)
      .expect(constants.HTTP_STATUS_OK);

    expect(exchangeWithSachaSftp).toHaveBeenCalledOnce();
  });

  test('ne lance rien quand l’échange est désactivé', async () => {
    config.sigal.sftp.exchangeEnabled = false;

    await request(app)
      .get(testRoute)
      .set('authorization', config.m2mBasicToken)
      .expect(constants.HTTP_STATUS_OK);

    expect(exchangeWithSachaSftp).not.toHaveBeenCalled();
  });
});
