import { beforeAll, describe, expect, test } from 'vitest';
import { kysely } from './kysely';

import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { analysisRepository } from './analysisRepository';

describe('update', () => {
  let analysis: Omit<PartialAnalysis, 'id'> = null as unknown as never;

  beforeAll(async () => {
    analysis = {
      sampleId: Sample13Fixture.id,
      itemNumber: 1,
      copyNumber: 1,
      status: 'Completed',
      createdAt: new Date(),
      compliance: null,
      notesOnCompliance: null
    };
  });
  test("don't delete the ND residues", async () => {
    const analysisId = await analysisRepository.insert(analysis);

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
        },
        {
          analysisId,
          analysisMethod: 'Mono',
          residueNumber: 3,
          reference: 'RF-00000010-PAR',
          lmr: 10,
          result: 1,
          resultKind: 'Q'
        }
      ])
      .execute();

    await analysisRepository.update({ ...analysis, id: analysisId });
    const residuesInDb = await kysely
      .selectFrom('analysisResidues')
      .select('reference')
      .where('analysisId', '=', analysisId)
      .execute();
    expect(residuesInDb).toHaveLength(1);
    expect(residuesInDb?.[0]?.reference).toBe('RF-00000012-PAR');
  });

  test('reorder correctly the residues', async () => {
    const analysisId = await analysisRepository.insert(analysis);

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
        },
        {
          analysisId,
          analysisMethod: 'Mono',
          residueNumber: 3,
          reference: 'RF-00000010-PAR',
          lmr: 10,
          result: 1,
          resultKind: 'NQ'
        }
      ])
      .execute();

    await analysisRepository.update({
      ...analysis,
      id: analysisId,
      residues: [
        {
          analysisId,
          analysisMethod: 'Mono',
          residueNumber: 2,
          reference: 'RF-00000010-PAR',
          lmr: 10,
          result: 1,
          resultKind: 'Q'
        }
      ]
    });
    const residuesInDb = await kysely
      .selectFrom('analysisResidues')
      .select(['reference', 'residueNumber'])
      .where('analysisId', '=', analysisId)
      .execute();
    expect(residuesInDb).toHaveLength(2);
    expect(residuesInDb?.[1]).toMatchObject({
      reference: 'RF-00000010-PAR',
      residueNumber: 3
    });
    expect(residuesInDb?.[0]).toMatchObject({
      reference: 'RF-00000012-PAR',
      residueNumber: 2
    });
  });
});
describe('findUnique', () => {
  test('find only residues without ND result_kind', async () => {
    const analysisId = uuidv4();
    await kysely
      .insertInto('analysis')
      .values([
        {
          sampleId: Sample13Fixture.id,
          id: analysisId,
          status: 'Completed'
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
        },
        {
          analysisId,
          analysisMethod: 'Mono',
          residueNumber: 3,
          reference: 'RF-00000010-PAR',
          lmr: 10,
          result: 1,
          resultKind: 'NQ'
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
        },
        {
          analysisId: analysisId,
          analysisMethod: 'Mono',
          lmr: 10,
          reference: 'RF-00000010-PAR',
          residueNumber: 2,
          result: 1
        }
      ],
      sampleId: '11111111-3333-3333-3333-333333333333',
      status: 'Completed'
    });
  });
});
