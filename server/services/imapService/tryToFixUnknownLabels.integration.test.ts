import {
  genPartialAnalysis,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import {
  Sample11Fixture,
  Sample1Item1Fixture
} from 'maestro-shared/test/sampleFixtures';
import { expect, test } from 'vitest';
import {
  Analysis,
  AnalysisResidues
} from '../../repositories/analysisRepository';
import { kysely } from '../../repositories/kysely';
import { tryToFixResiduesWithUnknownLabel } from './tryToFixUnknownLabels';

test('tryToFixResiduesWithUnknownLabel', async () => {
  const analysisWithResidues = genPartialAnalysis({
    sampleId: Sample11Fixture.id,
    createdBy: Sample11Fixture.id
  });
  const residues = [
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      reference: undefined,
      residueNumber: 1,
      unknownLabel: 'clodinafop-propargyl'
    }),
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      reference: undefined,
      residueNumber: 2,
      unknownLabel: 'unknown'
    })
  ];

  await kysely
    .insertInto('laboratoryResidueMappings')
    .values([
      {
        laboratoryId: Sample1Item1Fixture.laboratoryId!,
        label: 'clodinafop-propargyl',
        ssd2Id: 'RF-0565-001-PPP'
      }
    ])
    .execute();

  await Analysis().insert([analysisWithResidues]);
  await AnalysisResidues().insert(residues);

  await tryToFixResiduesWithUnknownLabel();

  const analysisResidue = await kysely
    .selectFrom('analysisResidues')
    .where('analysisId', '=', analysisWithResidues.id)
    .selectAll()
    .execute();
  expect(analysisResidue).toHaveLength(2);
  expect(analysisResidue[0]).toMatchObject({
    reference: 'RF-0565-001-PPP',
    unknownLabel: null
  });
  expect(analysisResidue[1]).toMatchObject({
    reference: null,
    unknownLabel: 'unknown'
  });
});
