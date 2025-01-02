import fp from 'lodash';
import { Regions } from '../../../shared/referential/Region';
import { SampleStatus } from '../../../shared/schema/Sample/SampleStatus';
import {
  genCreatedPartialSample,
  genSampleItem
} from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import {
  Region1Fixture,
  Region2Fixture,
  Sampler1Fixture,
  Sampler2Fixture
} from './001-users';
import { ValidatedProgrammingPlanFixture } from './002-programming-plans';
import { CompanyFixture } from './003-companies';

const Sample11FixtureId = '11111111-1111-1111-1111-111111111111';
const Sample1Item1Fixture = genSampleItem({
  sampleId: Sample11FixtureId,
  itemNumber: 1,
  quantity: 534,
  quantityUnit: 'G185A',
  compliance200263: true,
  sealId: '123456'
});
export const Sample11Fixture = genCreatedPartialSample({
  id: Sample11FixtureId,
  sampledAt: new Date('2025-05-06'),
  department: '08',
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  legalContext: 'A',
  resytalId: '23-123456',
  company: CompanyFixture,
  notesOnCreation: 'notes on creation',
  reference: 'GES-08-24-313-A',
  sampler: fp.pick(Sampler1Fixture, ['id', 'firstName', 'lastName']),
  createdAt: new Date('2023-01-02'),
  lastUpdatedAt: new Date('2024-03-04'),
  status: 'DraftMatrix' as SampleStatus,
  matrix: 'A06MS',
  matrixPart: 'PART1',
  cultureKind: 'PD07A',
  releaseControl: false,
  stage: 'STADE7',
  items: [Sample1Item1Fixture]
});

export const Sample12Fixture = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '11111111-2222-2222-2222-222222222222',
  status: 'Draft' as SampleStatus,
  department: oneOf(Regions[Region1Fixture].departments),
  reference: 'GES-08-24-314-A'
});

export const Sample13Fixture = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '11111111-3333-3333-3333-333333333333',
  status: 'Sent' as SampleStatus,
  department: oneOf(Regions[Region1Fixture].departments),
  reference: 'GES-08-24-315-A'
});
export const Sample2Fixture = genCreatedPartialSample({
  sampler: Sampler2Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '22222222-2222-2222-2222-222222222222',
  status: 'DraftMatrix' as SampleStatus,
  department: oneOf(Regions[Region2Fixture].departments),
  reference: 'PDL-08-24-313-A'
});

export const seed = async (): Promise<void> => {
  await Samples().insert([
    formatPartialSample(Sample11Fixture),
    formatPartialSample(Sample12Fixture),
    formatPartialSample(Sample13Fixture),
    formatPartialSample(Sample2Fixture)
  ]);
  await SampleItems().insert(Sample1Item1Fixture);
};
