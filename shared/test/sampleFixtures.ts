import { fakerFR } from '@faker-js/faker';
import { pick } from 'lodash-es';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { CultureKindList } from '../referential/CultureKind';
import { LegalContextList } from '../referential/LegalContext';
import { Matrix, MatrixList } from '../referential/Matrix/Matrix';
import { MatrixKind } from '../referential/Matrix/MatrixKind';
import { MatrixPart, MatrixPartList } from '../referential/Matrix/MatrixPart';
import { QuantityUnitList } from '../referential/QuantityUnit';
import { Regions } from '../referential/Region';
import { Stage, StageList } from '../referential/Stage';
import { Company } from '../schema/Company/Company';
import { ContextList } from '../schema/ProgrammingPlan/Context';
import {
  CreatedSampleData,
  Geolocation,
  PartialSample,
  Sample,
  SampleContextData
} from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
import { SampleStatus } from '../schema/Sample/SampleStatus';
import { CompanyFixture, genCompany } from './companyFixtures';
import { ValidatedProgrammingPlanFixture } from './programmingPlanFixtures';
import { genBoolean, genNumber, oneOf } from './testFixtures';
import {
  Region1Fixture,
  Region2Fixture,
  Sampler1Fixture,
  Sampler2Fixture
} from './userFixtures';

export const genSampleContextData = (
  data?: Partial<SampleContextData>
): SampleContextData => ({
  id: uuidv4(),
  sampledAt: new Date(),
  department: oneOf(Regions['44'].departments),
  geolocation: {
    x: 48.8566,
    y: 2.3522
  },
  programmingPlanId: uuidv4(),
  context: oneOf(ContextList),
  legalContext: oneOf(LegalContextList),
  resytalId:
    '23-' +
    randomstring.generate({
      length: 6,
      charset: '123456789'
    }),
  company: genCompany(),
  notesOnCreation: randomstring.generate(),
  status: 'Draft',
  ...data
});
export const genCreatedSampleData = (
  data?: Partial<CreatedSampleData>
): CreatedSampleData => ({
  region: '44',
  reference: `GES-${oneOf(Regions['44'].departments)}-24-${genNumber(
    4
  )}-${oneOf(LegalContextList)}`,
  sampler: {
    id: uuidv4(),
    firstName: fakerFR.person.firstName(),
    lastName: fakerFR.person.lastName()
  },
  createdAt: new Date(),
  lastUpdatedAt: new Date(),
  ...data
});
export const genCreatedPartialSample = (
  data?: Partial<PartialSample>
): PartialSample => {
  const contextData = genSampleContextData(data);
  return {
    ...contextData,
    ...genCreatedSampleData(data),
    company: genCompany(),
    matrix: oneOf(MatrixList),
    matrixPart: oneOf(MatrixPartList),
    stage: oneOf(StageList),
    cultureKind: oneOf(CultureKindList),
    releaseControl: genBoolean(),
    items: [genSampleItem({ sampleId: contextData.id, itemNumber: 1 })],
    ...data
  };
};
export const genCreatedSample = (data?: Partial<Sample>): Sample => {
  const sample = genCreatedPartialSample(data);
  return {
    ...sample,
    geolocation: sample.geolocation as Geolocation,
    company: sample.company as Company,
    matrixKind: sample.matrix as MatrixKind,
    matrix: sample.matrix as Matrix,
    matrixPart: sample.matrixPart as MatrixPart,
    stage: sample.stage as Stage,
    prescriptionId: uuidv4(),
    laboratoryId: uuidv4(),
    items: sample.items as SampleItem[],
    ownerAgreement: genBoolean(),
    ...data
  };
};
export const genSampleItem = (data?: Partial<SampleItem>): SampleItem => ({
  sampleId: uuidv4(),
  itemNumber: genNumber(2),
  quantity: genNumber(3),
  quantityUnit: oneOf(QuantityUnitList),
  compliance200263: genBoolean(),
  sealId: randomstring.generate(),
  recipientKind: 'Laboratory',
  ...data
});
const Sample11FixtureId = '11111111-1111-1111-1111-111111111111';
export const Sample1Item1Fixture = genSampleItem({
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
  sampler: pick(Sampler1Fixture, ['id', 'firstName', 'lastName']),
  createdAt: new Date('2023-01-02'),
  lastUpdatedAt: new Date('2024-03-04'),
  status: 'DraftMatrix' as SampleStatus,
  matrix: 'A00GZ',
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
