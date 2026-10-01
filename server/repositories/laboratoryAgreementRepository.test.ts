import { DAOALaboratoryAgreementFixture } from 'maestro-shared/test/laboratoryAgreementFixtures';
import { describe, expect, test } from 'vitest';
import { laboratoryAgreementRepository } from './laboratoryAgreementRepository';

describe('findMany', () => {
  test('should find only the agreements whose sub-plan selects one of the matrix kinds', async () => {
    const agreements = await laboratoryAgreementRepository.findMany({
      matrixKinds: ['A01SN']
    });

    expect(agreements).toStrictEqual([
      expect.objectContaining(DAOALaboratoryAgreementFixture)
    ]);
  });
});
