import { describe, expect, test } from 'vitest';
import { cropFileName } from './stringUtils';

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
