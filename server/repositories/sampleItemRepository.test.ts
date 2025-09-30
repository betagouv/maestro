import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { describe, test } from 'vitest';
import sampleItemRepository from './sampleItemRepository';

describe('updateMany sampleItems', async () => {
  test('no duplicate keys', async () => {
    await sampleItemRepository.updateMany(Sample11Fixture.id, [
      {
        itemNumber: 1,
        sampleId: Sample11Fixture.id
      },
      {
        itemNumber: 1,
        sampleId: Sample11Fixture.id
      }
    ]);
  });
});
