import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

jest.useFakeTimers({
  legacyFakeTimers: true,
});
