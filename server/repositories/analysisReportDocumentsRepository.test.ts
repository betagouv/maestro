import { describe, expect, test } from 'vitest';

import { genDocument } from 'maestro-shared/test/documentFixtures';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { analysisReportDocumentsRepository } from './analysisReportDocumentsRepository';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
import { kysely } from './kysely';

describe('analysisReportDocuments', () => {
  test('insert find and delete', async () => {
    const document = genDocument({
      createdBy: Sampler1Fixture.id,
      kind: 'AnalysisReportDocument'
    });

    await documentRepository.insert(document);

    const analysisId = await analysisRepository.insert({
      sampleId: Sample13Fixture.id,
      status: 'Completed',
      createdAt: new Date()
    });
    await kysely.deleteFrom('analysisReportDocuments').execute();
    await analysisReportDocumentsRepository.insert(analysisId, document.id);

    let result = await kysely
      .selectFrom('analysisReportDocuments')
      .selectAll()
      .execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      analysisId,
      documentId: document.id
    });

    const documentIdInDb =
      await analysisReportDocumentsRepository.findByAnalysisId(analysisId);
    expect(documentIdInDb).toHaveLength(1);
    expect(documentIdInDb[0]).toEqual(document.id);

    await analysisReportDocumentsRepository.deleteOne(analysisId, document.id);
    result = await kysely
      .selectFrom('analysisReportDocuments')
      .selectAll()
      .execute();
    expect(result).toHaveLength(0);
  });
});
