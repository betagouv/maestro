import { Sample1Item1Fixture } from 'maestro-shared/test/sampleFixtures';
import { describe, expect, test } from 'vitest';
import sampleItemRepository from './sampleItemRepository';

describe('update sampleItem', () => {
  test('find and update', async () => {
    const { sampleId, itemNumber, copyNumber } = Sample1Item1Fixture;

    let item = await sampleItemRepository.findUnique(
      sampleId,
      itemNumber,
      copyNumber
    );

    expect(item).toMatchObject(Sample1Item1Fixture);

    const updatedQuantity = 999;
    await sampleItemRepository.update(sampleId, itemNumber, copyNumber, {
      ...Sample1Item1Fixture,
      quantity: updatedQuantity,
      analysis: { status: 'Completed' }
    });

    item = await sampleItemRepository.findUnique(
      sampleId,
      itemNumber,
      copyNumber
    );

    expect(item).toMatchObject({
      ...Sample1Item1Fixture,
      quantity: updatedQuantity
    });
  });
});
