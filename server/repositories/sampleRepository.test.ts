import { Department } from 'maestro-shared/referential/Department';
import { ResultKind } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  Sample11Fixture,
  Sample2Fixture
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
import { sampleRepository } from './sampleRepository';

describe('count samples', async () => {
  test('count without options', async () => {
    const count = await sampleRepository.count({
      programmingPlanId: Sample11Fixture.programmingPlanId
    });
    expect(count).toEqual(4);
  });

  test('count with department option', async () => {
    let count = await sampleRepository.count({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      departments: ['72']
    });
    expect(count).toEqual(0);

    count = await sampleRepository.count({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      departments: [Sample11Fixture.department as Department]
    });
    expect(count).toEqual(1);
  });

  test('count with region option', async () => {
    let count = await sampleRepository.count({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      region: '01'
    });
    expect(count).toEqual(0);

    count = await sampleRepository.count({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      region: Sample11Fixture.region
    });
    expect(count).toEqual(3);
  });
});

describe('findMany samples', async () => {
  test('find without options', async () => {
    const samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId
    });
    expect(samples).toHaveLength(4);
  });

  test('find with department option', async () => {
    let samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      departments: ['72']
    });
    expect(samples).toEqual([]);

    samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      departments: [Sample11Fixture.department as Department]
    });
    expect(samples).toHaveLength(1);
  });

  test('find with compliance option', async () => {
    const document = genDocument({
      createdBy: Sampler1Fixture.id,
      kind: 'AnalysisReportDocument'
    });

    await documentRepository.insert(document);

    const analysisOK = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      reportDocumentId: document.id,
      createdBy: Sampler1Fixture.id,
      status: 'Completed',
      compliance: true
    });

    await analysisRepository.insert(analysisOK);

    let samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      compliance: 'conform'
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(analysisOK.sampleId);

    const analysisKO = genPartialAnalysis({
      sampleId: Sample2Fixture.id,
      reportDocumentId: document.id,
      createdBy: Sample2Fixture.id,
      status: 'Completed',
      compliance: false
    });

    await analysisRepository.insert(analysisKO);

    samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      compliance: 'notConform',
      status: 'DraftMatrix'
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(analysisKO.sampleId);

    samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId
    });
    expect(samples).not.toHaveLength(1);
  });

  test('find with withAtLeastOneResidue option', async () => {
    const document = genDocument({
      createdBy: Sampler1Fixture.id,
      kind: 'AnalysisReportDocument'
    });

    await documentRepository.insert(document);

    const analysisWithoutResidues = genPartialAnalysis({
      sampleId: Sample11Fixture.id,
      reportDocumentId: document.id,
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
      reportDocumentId: document.id,
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
      programmingPlanId: Sample11Fixture.programmingPlanId
    });
    expect(samples).not.toHaveLength(1);

    samples = await sampleRepository.findMany({
      programmingPlanId: Sample11Fixture.programmingPlanId,
      withAtLeastOneResidue: true
    });
    expect(samples).toHaveLength(1);
    expect(samples[0].id).toBe(analysisWithResidues.sampleId);
  });
});
