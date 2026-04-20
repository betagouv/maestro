import { expect, test } from 'vitest';
import { Regions } from './Region';

test('Regions timezones are valid IANA identifiers', () => {
  const date = new Date('2025-01-01T00:00:00Z');
  for (const region of Object.values(Regions)) {
    if (region.timezone) {
      expect(
        () =>
          new Intl.DateTimeFormat('fr', { timeZone: region.timezone }).format(
            date
          ),
        `Region ${region.name} has invalid timezone: ${region.timezone}`
      ).not.toThrow();
    }
  }
});
