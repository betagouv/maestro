import type { Department } from 'maestro-shared/referential/Department';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import type { ResultKind } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  genSampleItem,
  Sample2Fixture,
  Sample11Fixture,
  Sample13Fixture,
  SampleDAOA1Fixture,
  SampleDAOA2Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { toArray } from 'maestro-shared/utils/utils';
import { describe, expect, test } from 'vitest';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
import { SampleItems } from './sampleItemRepository';
import { sampleRepository } from './sampleRepository';

describe('count samples', async () => {
  test('count without options', async () => {
    const count = await sampleRepository.count({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(count).toEqual(4);
  });

  test('count with department option', async () => {
    let count = await sampleRepository.count({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      departments: ['72']
    });
    expect(count).toEqual(0);

    count = await sampleRepository.count({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      departments: [Sample11Fixture.department as Department]
    });
    expect(count).toEqual(1);
  });

  test('count with region option', async () => {
    let count = await sampleRepository.count({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      regions: ['01']
    });
    expect(count).toEqual(0);

    count = await sampleRepository.count({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      regions: [Sample11Fixture.region]
    });
    expect(count).toEqual(3);
  });
});

describe('findMany samples', async () => {
  test('find without options', async () => {
    const samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(samples).toHaveLength(4);
  });

  test('find with department option', async () => {
    let samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      departments: ['72']
    });
    expect(samples).toEqual([]);

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      departments: [Sample11Fixture.department as Department]
    });
    expect(samples).toHaveLength(1);
  });

  test('find with matrixKinds option', async () => {
    let samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      matrixKinds: ['A00PX']
    });
    expect(samples).toEqual([]);

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      matrixKinds: [Sample11Fixture.matrixKind as MatrixKind]
    });
    expect(samples).toHaveLength(1);
  });

  test('find with compliance option', async () => {
    const sample = (await sampleRepository.findUnique(
      Sample11Fixture.id
    )) as SampleChecked;
    await sampleRepository.update({
      ...sample,
      compliance: 'Compliant' as const
    });

    let samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      compliance: 'Compliant'
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(Sample11Fixture.id);

    await sampleRepository.update({
      ...sample,
      compliance: 'NonCompliant' as const
    });

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      compliance: 'NonCompliant',
      statuses: ['Draft']
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(Sample11Fixture.id);

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(samples).not.toHaveLength(1);

    await sampleRepository.update({
      ...sample
    });
  });

  test('find with laboratoryIds option', async () => {
    let samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      laboratoryIds: ['00000000-0000-0000-0000-000000000000']
    });
    expect(samples).toEqual([]);

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      laboratoryIds: [LaboratoryFixture.id]
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(Sample11Fixture.id);
  });

  test('find with withAtLeastOneResidue option', async () => {
    const document = genDocument({
      createdBy: Sampler1Fixture.id,
      kind: 'AnalysisReportDocument'
    });

    await documentRepository.insert(document);

    const analysisWithoutResidues = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'Completed',
      compliance: true
    });
    await analysisRepository.insert(analysisWithoutResidues);
    await analysisRepository.update({
      ...analysisWithoutResidues,
      residues: [
        {
          resultKind: 'ND' as ResultKind,
          analysisMethod: 'Mono',
          reference: 'RF-00000010-CHE',
          analysisId: analysisWithoutResidues.id,
          residueNumber: 0
        }
      ]
    });

    const analysisWithResidues = genPartialAnalysis({
      sampleId: Sample2Fixture.id,
      createdBy: Sampler1Fixture.id,
      status: 'Completed',
      compliance: true
    });
    await analysisRepository.insert(analysisWithResidues);
    await analysisRepository.update({
      ...analysisWithResidues,
      residues: [
        {
          resultKind: 'NQ',
          analysisMethod: 'Mono',
          reference: 'RF-00000010-CHE',
          analysisId: analysisWithResidues.id,
          residueNumber: 0
        }
      ]
    });

    let samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(samples).not.toHaveLength(1);

    samples = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId),
      withAtLeastOneResidue: true
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(analysisWithResidues.sampleId);
  });
});

describe('hasDetectedResidueWithInterpretation', async () => {
  const insertAnalysisWithResidue = async (
    sampleId: string,
    copyNumber: number,
    compliance: boolean | null,
    resultKind: ResultKind
  ) => {
    const analysis = genPartialAnalysis({
      sampleId,
      copyNumber,
      createdBy: Sampler1Fixture.id,
      status: 'Completed',
      compliance
    });
    await analysisRepository.insert(analysis);
    await analysisRepository.update({
      ...analysis,
      residues: [
        {
          resultKind,
          analysisMethod: 'Mono',
          reference: 'RF-00000010-CHE',
          analysisId: analysis.id,
          residueNumber: 0
        }
      ]
    });
  };

  test('true when a single analysis has both a detected residue and an interpretation', async () => {
    await insertAnalysisWithResidue(Sample13Fixture.id, 1, true, 'NQ');

    expect(
      await sampleRepository.hasDetectedResidueWithInterpretation(
        Sample13Fixture.id
      )
    ).toBe(true);
  });

  test('false when a detected residue has no interpretation', async () => {
    await insertAnalysisWithResidue(SampleDAOA1Fixture.id, 1, null, 'NQ');

    expect(
      await sampleRepository.hasDetectedResidueWithInterpretation(
        SampleDAOA1Fixture.id
      )
    ).toBe(false);
  });

  test('false when the detected residue and the interpretation are on two different copies', async () => {
    await SampleItems().insert(
      genSampleItem({
        sampleId: SampleDAOA2Fixture.id,
        itemNumber: 1,
        copyNumber: 2
      })
    );

    await insertAnalysisWithResidue(SampleDAOA2Fixture.id, 1, null, 'NQ');
    await insertAnalysisWithResidue(
      SampleDAOA2Fixture.id,
      2,
      true,
      'ND' as ResultKind
    );

    expect(
      await sampleRepository.hasDetectedResidueWithInterpretation(
        SampleDAOA2Fixture.id
      )
    ).toBe(false);
  });
});

describe('findUnique', async () => {
  test('does not duplicate documentIds when sample has multiple specificData values', async () => {
    const document = genDocument({
      createdBy: Sampler1Fixture.id,
      kind: 'SampleDocument' as const
    });
    await documentRepository.insert(document);

    await sampleRepository.updateDocumentIds(Sample11Fixture.id, [document.id]);

    const sample = await sampleRepository.findUnique(Sample11Fixture.id);

    expect(sample?.documentIds).toEqual([document.id]);

    await sampleRepository.updateDocumentIds(Sample11Fixture.id, []);
  });
});

describe('deleteDraftOnProgrammingPlan', async () => {
  test('deletes only draft samples for the given programmingPlanId', async () => {
    const before = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(before).toHaveLength(4);

    await sampleRepository.deleteDraftOnProgrammingPlan(
      '00000000-0000-0000-0000-000000000000'
    );

    let after = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample2Fixture.programmingPlanId)
    });
    expect(after).toHaveLength(4);

    await sampleRepository.deleteDraftOnProgrammingPlan(
      Sample11Fixture.programmingPlanId
    );

    after = await sampleRepository.findMany({
      programmingPlanIds: toArray(Sample11Fixture.programmingPlanId)
    });
    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(Sample13Fixture.id);
  });
});
