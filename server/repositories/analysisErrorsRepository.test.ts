import { expect, test } from 'vitest';
import { analysisErrorsRepository } from './analysisErrorsRepository';
import { kysely } from './kysely';

import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
test("peut ajouter une erreur d'analyse en base", async () => {
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

  let analysisErrorsInDb = await kysely
    .selectFrom('analysisErrors')
    .selectAll()
    .execute();
  expect(analysisErrorsInDb).toHaveLength(0);
  await analysisErrorsRepository.insert(
    analysisId,
    [
      {
        reference: 'RF-00000024-PAR',
        residueNumber: 0,
        analysisMethod: 'Mono',
        resultKind: 'NQ'
      }
    ],
    []
  );
  analysisErrorsInDb = await kysely
    .selectFrom('analysisErrors')
    .selectAll()
    .execute();
  expect(analysisErrorsInDb).toHaveLength(1);
  expect(analysisErrorsInDb[0].residues.old[0].reference).toEqual(
    'RF-00000024-PAR'
  );
});
