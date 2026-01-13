import { fakerFR } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { kysely } from './kysely';
import { SachaResidueMappings } from './kysely.type';
import { sachaResidueMappingRepository } from './sachaResidueMappingRepository';

test('findByLabel', async () => {
  let ssd2Id = await sachaResidueMappingRepository.findByLabel('none');

  expect(ssd2Id).toBeNull();

  const residueMapping: SachaResidueMappings = {
    label: fakerFR.string.alphanumeric(),
    ssd2Id: fakerFR.string.alphanumeric()
  };
  await kysely
    .insertInto('sachaResidueMappings')
    .values(residueMapping)
    .execute();

  ssd2Id = await sachaResidueMappingRepository.findByLabel(
    residueMapping.label
  );

  expect(ssd2Id).toBe(residueMapping.ssd2Id);
});
