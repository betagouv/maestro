import {
  genPartialAnalysis,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import { Sample2Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { expect, test } from 'vitest';
import {
  Analysis,
  AnalysisResidues
} from '../../repositories/analysisRepository';
import { kysely } from '../../repositories/kysely';
import { girpaConf } from './girpa';
import { tryToFixResiduesWithUnknownLabel } from './tryToFixUnknownLabels';

test('tryToFixResiduesWithUnknownLabel', async () => {
  const analysisWithResidues = genPartialAnalysis({
    sampleId: Sample2Fixture.id,
    createdBy: Sampler1Fixture.id
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
      unknownLabel: 'desmedipham'
    }),
    genPartialResidue({
      analysisId: analysisWithResidues.id,
      reference: undefined,
      residueNumber: 3,
      unknownLabel: 'unknown'
    })
  ];

  await Analysis().insert([analysisWithResidues]);
  await AnalysisResidues().insert(residues);

  await tryToFixResiduesWithUnknownLabel();

  const analysisResidue = await kysely
    .selectFrom('analysisResidues')
    .where('analysisId', '=', analysisWithResidues.id)
    .selectAll()
    .execute();
  expect(analysisResidue).toHaveLength(3);
  expect(analysisResidue[0]).toMatchObject({
    reference: girpaConf.ssd2IdByLabel['clodinafop-propargyl'],
    unknownLabel: null
  });
  expect(analysisResidue[1]).toMatchObject({
    reference: girpaConf.ssd2IdByLabel['desmedipham'],
    unknownLabel: null
  });
  expect(analysisResidue[2]).toMatchObject({
    reference: null,
    unknownLabel: 'unknown'
  });
});
