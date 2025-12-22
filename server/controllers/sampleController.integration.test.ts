import { describe, expect, test } from 'vitest';
import { getNewReference } from './sampleController';

describe('getNewReference', () => {
  test('2025', async () => {
    const currentYear = 2025;
    let reference = await getNewReference('01', currentYear);

    expect(reference).toBe('GUA-25-0001');

    reference = await getNewReference('01', currentYear);

    expect(reference).toBe('GUA-25-0002');

    reference = await getNewReference('02', currentYear);

    expect(reference).toBe('MAR-25-0001');
  });

  test('2026', async () => {
    const currentYear = 2026;
    let reference = await getNewReference('01', currentYear);

    expect(reference).toBe('GUA-25-00001');

    reference = await getNewReference('01', currentYear);

    expect(reference).toBe('GUA-25-00002');

    reference = await getNewReference('02', currentYear);

    expect(reference).toBe('MAR-25-00003');
  });
});
