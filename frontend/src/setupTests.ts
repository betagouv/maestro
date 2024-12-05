// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import "@testing-library/jest-dom/vitest";
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

createFetchMock(vi).enableMocks();

export const mockGeolocation = {
  getCurrentPosition: vi.fn()
};

// @ts-expect-error TS2540
global.navigator.geolocation = mockGeolocation;

global.URL.createObjectURL = vi.fn();

vi.mock('src/hooks/useOnLine', () => ({
  useOnLine: () => ({ isOnline: true }),
}));

