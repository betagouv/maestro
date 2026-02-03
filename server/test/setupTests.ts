import { afterAll, afterEach, beforeAll, Mock, vi } from 'vitest';
import { dbManager } from './db-manager';
import { dbSeed } from './seed';

type Procedure = (...args: any[]) => any;
export const mockGetAuthorizationUrl: Mock<Procedure> = vi.fn();
export const mockAuthenticate: Mock<Procedure> = vi.fn();
export const mockGetLogoutUrl: Mock<Procedure> = vi.fn();
export const mockGenerateSampleSupportPDF: Mock<Procedure> = vi.fn();
export const mockSendNotification: Mock<Procedure> = vi.fn();
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
vi.mock('../services/notificationService', () => ({
  notificationService: {
    sendNotification: (...args: any[]) => mockSendNotification(...args)
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
