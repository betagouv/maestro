import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import config from '../utils/config';
import { tchapService } from './tchapService';

const fetchMock = vi.fn();

describe('tchapService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock
      .mockReset()
      .mockResolvedValue(new Response(null, { status: 200 }));
    config.tchap.homeserverUrl = 'https://matrix.agent.example.tchap.gouv.fr';
    config.tchap.accessToken = 'mct_token';
    config.tchap.roomId = '!abcdef:agent.example.tchap.gouv.fr';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("n'envoie rien si la configuration est incomplète", async () => {
    config.tchap.accessToken = null;

    await tchapService.send('[Maestro] Coucou');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('poste le message dans le salon', async () => {
    await tchapService.send('[Maestro] Coucou');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(
      /^https:\/\/matrix\.agent\.example\.tchap\.gouv\.fr\/_matrix\/client\/v3\/rooms\/!abcdef%3Aagent\.example\.tchap\.gouv\.fr\/send\/m\.room\.message\/[0-9a-f-]{36}$/
    );
    expect(init.method).toBe('PUT');
    expect(init.headers.Authorization).toBe('Bearer mct_token');
    expect(JSON.parse(init.body)).toStrictEqual({
      msgtype: 'm.text',
      body: '[Maestro] Coucou'
    });
  });

  test('ne relaie pas une erreur du serveur Matrix', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"errcode":"M_FORBIDDEN"}', { status: 403 })
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(
      tchapService.send('[Maestro] Coucou')
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError.mock.calls[0][0]).toContain('403');
  });

  test('ne relaie pas une erreur réseau', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(
      tchapService.send('[Maestro] Coucou')
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledOnce();
  });
});
