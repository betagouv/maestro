import { describe, expect, test } from 'vitest';
import { kysely } from './kysely';

import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { analysisRepository } from './analysisRepository';

describe('findUnique', () => {
  test('find only residues with result', async () => {
    const document = await kysely
      .insertInto('documents')
      .values([
        {
          filename: 'test',
          kind: 'AnalysisReportDocument'
        }
      ])
      .returningAll()
      .executeTakeFirstOrThrow();

    const analysisId = uuidv4();
    await kysely
      .insertInto('analysis')
      .values([
        {
          sampleId: Sample13Fixture.id,
          id: analysisId,
          status: 'Completed',
          reportDocumentId: document.id
        }
      ])
      .execute();

    await kysely
      .insertInto('analysisResidues')
      .values([
        {
          analysisId,
          analysisMethod: 'Mono',
          residueNumber: 1,
          reference: 'RF-00000007-PAR',
          lmr: 10,
          result: 1,
          resultKind: 'Q'
        },
        {
          analysisId,
          analysisMethod: 'Multi',
          reference: 'RF-00000012-PAR',
          residueNumber: 2,
          resultKind: 'ND'
        }
      ])
      .execute();

    await kysely
      .insertInto('residueAnalytes')
      .values([
        {
          analysisId,
          reference: 'RF-00000013-PAR',
          residueNumber: 1,
          analyteNumber: 1,
          resultKind: 'Q',
          result: 2
        }
      ])
      .execute();

    const analysisInDb = await analysisRepository.findUnique(analysisId);

    expect(analysisInDb).toMatchObject({
      id: analysisId,
      reportDocumentId: document.id,
      residues: [
        {
          analysisId: analysisId,
          analysisMethod: 'Mono',
          reference: 'RF-00000007-PAR',
          residueNumber: 1,
          lmr: 10,
          result: 1,
          resultKind: 'Q',
          analytes: [
            {
              analysisId,
              reference: 'RF-00000013-PAR',
              residueNumber: 1,
              analyteNumber: 1,
              resultKind: 'Q',
              result: 2
            }
          ]
        }
      ],
      sampleId: '11111111-3333-3333-3333-333333333333',
      status: 'Completed'
    });
  });
});
