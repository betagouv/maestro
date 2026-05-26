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

describe('findOrphanLabelsByLaboratoryId', () => {
  test('returns distinct unknownLabels not yet mapped for the laboratory', async () => {
    const laboratoryId = Sample1Item1Fixture.laboratoryId!;
    const orphanLabel = 'orphan-pesticide-A';
    const mappedLabel = 'mapped-pesticide-B';
    const otherLaboratoryLabel = 'other-lab-pesticide';

    const analysis = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sample11Fixture.id
    });
    const analysis2 = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sample11Fixture.id
    });
    await Analysis().insert([analysis, analysis2]);

    await AnalysisResidues().insert([
      genPartialResidue({
        analysisId: analysis.id,
        reference: undefined,
        residueNumber: 1,
        unknownLabel: orphanLabel
      }),
      genPartialResidue({
        analysisId: analysis.id,
        reference: undefined,
        residueNumber: 2,
        unknownLabel: orphanLabel
      }),
      genPartialResidue({
        analysisId: analysis2.id,
        reference: undefined,
        residueNumber: 1,
        unknownLabel: mappedLabel
      })
    ]);

    await kysely
      .insertInto('laboratoryResidueMappings')
      .values({
        laboratoryId,
        label: mappedLabel,
        ssd2Id: 'RF-0565-001-PPP'
      })
      .onConflict((oc) =>
        oc
          .columns(['laboratoryId', 'label'])
          .doUpdateSet({ ssd2Id: 'RF-0565-001-PPP' })
      )
      .execute();

    const otherLaboratoryId = DummyLaboratoryIds.find(
      (id) => id !== laboratoryId
    )!;
    await kysely
      .insertInto('laboratoryResidueMappings')
      .values({
        laboratoryId: otherLaboratoryId,
        label: otherLaboratoryLabel,
        ssd2Id: null
      })
      .onConflict((oc) =>
        oc.columns(['laboratoryId', 'label']).doUpdateSet({ ssd2Id: null })
      )
      .execute();

    const orphans =
      await laboratoryResidueMappingRepository.findOrphanLabelsByLaboratoryId(
        laboratoryId
      );

    expect(orphans).toContain(orphanLabel);
    expect(orphans).not.toContain(mappedLabel);
    expect(orphans).not.toContain(otherLaboratoryLabel);
    expect(orphans.filter((label) => label === orphanLabel)).toHaveLength(1);
  });

  test('excludes labels from sample items sent to a different laboratory', async () => {
    const ownLaboratoryId = Sample1Item1Fixture.laboratoryId!;
    const otherLaboratoryId = DummyLaboratoryIds.find(
      (id) => id !== ownLaboratoryId
    )!;
    const foreignLabel = 'foreign-lab-label';

    const analysis = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sample11Fixture.id
    });
    await Analysis().insert([analysis]);

    await AnalysisResidues().insert([
      genPartialResidue({
        analysisId: analysis.id,
        reference: undefined,
        residueNumber: 5,
        unknownLabel: foreignLabel
      })
    ]);

    const orphansForOtherLab =
      await laboratoryResidueMappingRepository.findOrphanLabelsByLaboratoryId(
        otherLaboratoryId
      );

    expect(orphansForOtherLab).not.toContain(foreignLabel);
  });
});

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
