import { expect, test } from 'vitest';
import { formatWithTz } from './date';

test('formatWithTz', () => {
  expect(
    formatWithTz(
      new Date('2025-09-25T19:26:06.885Z'),
      'dd/MM/yyyy HH:mm',
      'America/Cayenne'
    )
  ).toEqual('25/09/2025 16:26');
});
