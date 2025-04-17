import { afterAll, beforeAll } from 'vitest';
import { dbManager } from './db-manager';
import { dbSeed } from './seed';

import { afterEach, vi } from 'vitest';

export const mockGetAuthorizationUrl = vi.fn();
export const mockAuthenticate = vi.fn();
export const mockGetLogoutUrl = vi.fn();
export const mockGenerateSampleSupportPDF = vi.fn();
vi.mock('../services/authService', () => ({
  getAuthService: Promise.resolve({
    getAuthorizationUrl: () => mockGetAuthorizationUrl(),
    authenticate: () => mockAuthenticate(),
    getLogoutUrl: () => mockGetLogoutUrl()
  })
}));
vi.mock('../services/pdfService/pdfService', () => ({
  pdfService: {
    generateSampleSupportPDF: () => mockGenerateSampleSupportPDF()
  }
}));

beforeAll(async () => {
  await dbManager.populateDb();
  await dbSeed();
});

afterAll(async () => {
  await dbManager.closeDb();
});

afterEach(() => {
  vi.restoreAllMocks();
});
