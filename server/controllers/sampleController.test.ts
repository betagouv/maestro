import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { PrescriptionFixture } from 'maestro-shared/test/prescriptionFixtures';
import {
  genCreatedSample,
  genSampleItem
} from 'maestro-shared/test/sampleFixtures';
import { PPVFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import type { MaestroDate } from 'maestro-shared/utils/date';
import { describe, expect, test } from 'vitest';
import { buildAnalysisRequestData } from './sampleController';

describe('buildAnalysisRequestData', () => {
  const sampleItem = genSampleItem({
    itemNumber: 1,
    copyNumber: 1,
    quantityUnit: 'G185A',
    compliance200263: true
  });

  const sample = genCreatedSample({
    region: '44',
    department: '44',
    company: CompanyFixture,
    matrixKind: 'A00GY',
    matrix: 'A00GZ',
    prescriptionId: PrescriptionFixture.id,
    sampler: { id: Sampler1Fixture.id, name: Sampler1Fixture.name },
    sampledDate: '2025-05-06' as MaestroDate,
    sampledTime: '10:30',
    context: 'Surveillance',
    legalContext: 'B',
    reference: 'GES-44-00003',
    specificData: { matrixPart: 'PART1', cultureKind: 'PD06A' }
  });

  test('builds AnalysisRequestData from sample', () => {
    expect(
      buildAnalysisRequestData(
        sample,
        sampleItem,
        Sampler1Fixture,
        LaboratoryFixture,
        [],
        PPVFieldConfigs
      )
    ).toMatchObject({
      compliance200263: 'Respectée',
      context: 'Plan de surveillance',
      copyNumber: 1,
      cultureKind: 'Production traditionnelle',
      department: 'Loire-Atlantique',
      legalContext: 'Police judiciaire',
      matrix: 'A00GZ',
      matrixKind: 'A00GY',
      matrixKindLabel: 'Aulx et échalotes',
      matrixLabel: 'Aulx',
      matrixPart: "Partie à laquelle s'applique la LMR",
      monoSubstanceLabels: [],
      monoSubstances: [],
      multiSubstanceLabels: [],
      multiSubstances: [],
      programmingPlanKind: 'PPV',
      quantityUnit: 'kJ/Daily portion',
      recipientKind: 'Laboratory',
      reference: 'GES-44-00003-A-1',
      region: '44',
      sampledDate: '06/05/2025',
      sampledTime: '10:30',
      sampler: {
        companies: [],
        department: null,
        disabled: false,
        email: 'john.doe@example.net',
        id: '11111111-1111-1111-1111-111111111111',
        laboratoryId: null,
        name: 'John Doe',
        programmingPlanKinds: ['PPV'],
        region: '44',
        roles: ['Sampler']
      },
      specificData: {
        cultureKind: 'PD06A',
        matrixPart: 'PART1'
      },
      stage: 'Végétal au stade récolte',
      status: 'Draft',
      step: 'Draft',
      substanceKind: 'Any'
    });
  });
});
