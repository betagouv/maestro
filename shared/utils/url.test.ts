import { describe, expect, test } from 'vitest';
import { serializeQuery } from './url';

describe('serializeQuery', () => {
  test('returns an empty string for an empty object', () => {
    expect(serializeQuery({})).toBe('');
  });

  test('drops nil and empty values', () => {
    expect(serializeQuery({ a: undefined, b: null, c: '', d: [] })).toBe('');
  });

  test('keeps booleans and numbers', () => {
    expect(serializeQuery({ page: 2, active: false })).toBe(
      '?page=2&active=false'
    );
  });

  test('serializes arrays as a comma-separated value', () => {
    expect(decodeURIComponent(serializeQuery({ ids: ['1', '2'] }))).toBe(
      '?ids=1,2'
    );
  });
});
