import { describe, expect, test } from 'vitest';
import config from './config';
import { getApiUrl, getURLQuery } from './fetchUtils';

describe('getURLQuery', () => {
  test('returns an empty string for an empty object', () => {
    expect(getURLQuery({})).toBe('');
  });

  test('drops nil and empty values', () => {
    expect(getURLQuery({ a: undefined, b: null, c: '' })).toBe('');
  });

  test('keeps numeric and string values', () => {
    expect(getURLQuery({ page: '2', perPage: 10 })).toBe('?page=2&perPage=10');
  });

  test('serializes arrays as a comma-separated value', () => {
    expect(decodeURIComponent(getURLQuery({ ids: ['1', '2'] }))).toBe(
      '?ids=1,2'
    );
  });
});

describe('getApiUrl', () => {
  test('appends a typed query to a known route', () => {
    expect(getApiUrl('/samples/export', { reference: 'ABC' })).toBe(
      `${config.apiEndpoint}/api/samples/export?reference=ABC`
    );
  });

  test('builds a route without query params', () => {
    expect(getApiUrl('/samples/export', {})).toBe(
      `${config.apiEndpoint}/api/samples/export`
    );
  });

  test('interpolates path params', () => {
    expect(
      getApiUrl('/samples/:sampleId/document', { sampleId: 'abc-123' })
    ).toBe(`${config.apiEndpoint}/api/samples/abc-123/document`);
  });
});
