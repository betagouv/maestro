import type { Department } from 'maestro-shared/referential/Department';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import type { ResultKind } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  Sample2Fixture,
  Sample11Fixture,
  Sample13Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { toArray } from 'maestro-shared/utils/utils';
import { describe, expect, test } from 'vitest';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
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
