import { DummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import {
  genPartialAnalysis,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import {
  Sample1Item1Fixture,
  Sample11Fixture
} from 'maestro-shared/test/sampleFixtures';
import { describe, expect, test } from 'vitest';
import { Analysis, AnalysisResidues } from './analysisRepository';
import { kysely } from './kysely';
import { laboratoryResidueMappingRepository } from './laboratoryResidueMappingRepository';

describe('applyResidueMapping', () => {
  test('updates only matching analysisResidues of the given laboratory', async () => {
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

    await Analysis().insert([analysisWithResidues]);
    await AnalysisResidues().insert(residues);

    await laboratoryResidueMappingRepository.applyResidueMapping(
      Sample1Item1Fixture.laboratoryId!,
      'clodinafop-propargyl',
      'RF-0565-001-PPP'
    );

    const analysisResidue = await kysely
      .selectFrom('analysisResidues')
      .where('analysisId', '=', analysisWithResidues.id)
      .selectAll()
      .orderBy('residueNumber')
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
});

describe('update', () => {
  const findMapping = (laboratoryId: string, label: string) =>
    kysely
      .selectFrom('laboratoryResidueMappings')
      .selectAll()
      .where('laboratoryId', '=', laboratoryId)
      .where('label', '=', label)
      .executeTakeFirst();

  test('creates a mapping with a null ssd2Id', async () => {
    const laboratoryId = DummyLaboratoryIds[0];
    const label = 'flonicamid sum';

    await laboratoryResidueMappingRepository.update({
      laboratoryId,
      label,
      ssd2Id: null
    });

    expect(await findMapping(laboratoryId, label)).toMatchObject({
      laboratoryId,
      label,
      ssd2Id: null
    });
  });

  test('updates the ssd2Id of an existing mapping', async () => {
    const laboratoryId = DummyLaboratoryIds[1];
    const label = 'later-associated';

    await laboratoryResidueMappingRepository.update({
      laboratoryId,
      label,
      ssd2Id: null
    });
    await laboratoryResidueMappingRepository.update({
      laboratoryId,
      label,
      ssd2Id: 'RF-0565-001-PPP'
    });

    expect((await findMapping(laboratoryId, label))?.ssd2Id).toBe(
      'RF-0565-001-PPP'
    );
  });
});
