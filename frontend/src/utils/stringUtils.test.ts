import { describe, expect, test } from 'vitest';
import { cropFileName, pluralize } from './stringUtils';

describe('cropFileName', () => {
  test('returns the original file name if it is within the max length', () => {
    expect(cropFileName('example.txt', 20)).toBe('example.txt');
  });

  test('crops the file name and adds ellipsis if it exceeds the max length', () => {
    expect(cropFileName('verylongfilename.txt', 10)).toBe('ve...e.txt');
  });

  test('returns the original file name if there is no extension and it is within the max length', () => {
    expect(cropFileName('example', 10)).toBe('example');
  });

  test('crops the file name without extension and adds ellipsis if it exceeds the max length', () => {
    expect(cropFileName('verylongfilename', 10)).toBe('veryl...me');
  });

  test('handles file names with long extensions correctly', () => {
    expect(cropFileName('example.verylongextension', 10)).toBe('...tension');
  });

  test('handles file names with extensions longer than the max length', () => {
    expect(cropFileName('example.verylongextension', 5)).toBe('...on');
  });
});

test('pluralize', () => {
  expect(pluralize(1)('prélèvement')).toBe('prélèvement');
  expect(pluralize(2)('prélèvement')).toBe('prélèvements');
  expect(pluralize(1)('prélèvement attribué')).toBe('prélèvement attribué');
  expect(pluralize(2)('prélèvement attribué')).toBe('prélèvements attribués');
  expect(pluralize(1, { preserveCount: true })('prélèvement attribué')).toBe(
    '1 prélèvement attribué'
  );
  expect(pluralize(2, { preserveCount: true })('prélèvement attribué')).toBe(
    '2 prélèvements attribués'
  );
  expect(
    pluralize(1, {
      replacements: [{ old: 'beau', new: 'beaux' }],
      ignores: ['à', 'attribuer']
    })('beau prélèvement à attribuer')
  ).toBe('beau prélèvement à attribuer');
  expect(
    pluralize(2, {
      preserveCount: true,
      replacements: [{ old: 'beau', new: 'beaux' }],
      ignores: ['à', 'attribuer']
    })('beau prélèvement à attribuer')
  ).toBe('2 beaux prélèvements à attribuer');
});
