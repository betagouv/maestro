import { constants } from 'node:http2';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { rewriteCompanySearchPath } from '../company.router';

describe('Company Router', () => {
  const { app } = createServer();

  describe('GET /companies/search', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/companies/search?${new URLSearchParams(params).toString()}`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });

  describe('rewriteCompanySearchPath', () => {
    // Non-régression http-proxy-middleware v4 : l'URL proxifiée ne doit pas
    // contenir « /? » entre « /search » et la query string
    test('rewrites "/" to "/search"', () => {
      expect(rewriteCompanySearchPath('/')).toBe('/search');
    });

    test('keeps the query string attached directly to "/search"', () => {
      expect(rewriteCompanySearchPath('/?q=asen&etat_administratif=A')).toBe(
        '/search?q=asen&etat_administratif=A'
      );
    });
  });
});
