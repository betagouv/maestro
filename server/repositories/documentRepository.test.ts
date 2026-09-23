import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Documents, documentRepository } from './documentRepository';

describe('documentRepository', () => {
  describe('findMany', () => {
    const year = PPVInProgressProgrammingPlanFixture.year;
    const otherYear = PPVValidatedProgrammingPlanFixture.year;

    const documentWithYear = genDocument({
      createdBy: NationalCoordinator.id,
      kind: 'TechnicalInstruction',
      year
    });
    const documentWithOtherYear = genDocument({
      createdBy: NationalCoordinator.id,
      kind: 'TechnicalInstruction',
      year: otherYear
    });
    const documentWithPlanOfYear = genDocument({
      createdBy: NationalCoordinator.id,
      kind: 'TechnicalInstruction',
      year: undefined,
      programmingPlanIds: [PPVInProgressProgrammingPlanFixture.id]
    });
    const documentWithPlanOfOtherYear = genDocument({
      createdBy: NationalCoordinator.id,
      kind: 'TechnicalInstruction',
      year: undefined,
      programmingPlanIds: [PPVValidatedProgrammingPlanFixture.id]
    });
    const documents = [
      documentWithYear,
      documentWithOtherYear,
      documentWithPlanOfYear,
      documentWithPlanOfOtherYear
    ];

    beforeAll(async () => {
      for (const document of documents) {
        await documentRepository.insert(document);
      }
    });

    afterAll(async () => {
      await Documents()
        .delete()
        .whereIn(
          'id',
          documents.map(({ id }) => id)
        );
    });

    test('should filter by the document year or the year of one of its programming plans', async () => {
      const result = await documentRepository.findMany({
        kinds: ['TechnicalInstruction'],
        programmingPlanIds: [
          PPVInProgressProgrammingPlanFixture.id,
          PPVValidatedProgrammingPlanFixture.id
        ],
        includeNoProgrammingPlan: true,
        year
      });

      const resultIds = result.map(({ id }) => id);
      expect(resultIds).toContain(documentWithYear.id);
      expect(resultIds).toContain(documentWithPlanOfYear.id);
      expect(resultIds).not.toContain(documentWithOtherYear.id);
      expect(resultIds).not.toContain(documentWithPlanOfOtherYear.id);
    });
  });
});
