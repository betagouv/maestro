import type { PartialSample } from 'maestro-shared/schema/Sample/Sample';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import {
  DAOAInProgressBovinSubPlanId,
  DAOAInProgressProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genSampleItem
} from 'maestro-shared/test/sampleFixtures';
import { SamplerDaoaFixture } from 'maestro-shared/test/userFixtures';
import { describe, expect, test } from 'vitest';
import { analysisRepository } from './analysisRepository';
import { analysisResidueRepository } from './analysisResidueRepository';
import sampleItemRepository from './sampleItemRepository';
import { sampleRepository } from './sampleRepository';

describe('findTopResiduesDetected', () => {
  const insertSampleWithResidue = async (
    reference: string,
    matrices: PartialSample['matrices']
  ) => {
    const sample = genCreatedPartialSample({
      reference,
      sampler: SamplerDaoaFixture,
      company: SlaughterhouseCompanyFixture1,
      programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
      programmingSubPlanId: DAOAInProgressBovinSubPlanId,
      context: 'Surveillance',
      region: '84',
      department: '69',
      specificData: {},
      matrices
    });
    await sampleRepository.insert(sample);
    await sampleItemRepository.insertMany([
      genSampleItem({ sampleId: sample.id, laboratoryId: null })
    ]);
    const analysis = genPartialAnalysis({
      sampleId: sample.id,
      createdBy: SamplerDaoaFixture.id,
      status: 'Completed'
    });
    await analysisRepository.insert(analysis);
    await analysisRepository.update({
      ...analysis,
      residues: [
        {
          resultKind: 'NQ',
          analysisMethod: 'Mono',
          reference: 'RF-00000010-CHE',
          analysisId: analysis.id,
          residueNumber: 0
        }
      ]
    });
  };

  test('compte le prélèvement dans chacune de ses matrices', async () => {
    await insertSampleWithResidue('DAOA-69-24-201-A', [
      { matrixKind: 'A00QT', matrix: 'A00QV' },
      { matrixKind: 'A01GP', matrix: 'A01GQ' }
    ]);
    await insertSampleWithResidue('DAOA-69-24-202-A', null);

    const stats = await analysisResidueRepository.findTopResiduesDetected(
      DAOAInProgressProgrammingPlanFixture.id
    );

    expect(stats).toStrictEqual(
      expect.arrayContaining([
        {
          residueReference: 'RF-00000010-CHE',
          matrix: 'A00QV',
          region: '84',
          sampleCount: 1,
          higherThanArfdCount: 0
        },
        {
          residueReference: 'RF-00000010-CHE',
          matrix: 'A01GQ',
          region: '84',
          sampleCount: 1,
          higherThanArfdCount: 0
        }
      ])
    );
    expect(stats).toHaveLength(2);
  });
});
