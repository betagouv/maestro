import { fakerFR } from '@faker-js/faker';
import { pick } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { CultureKindList } from '../referential/CultureKind';
import { LegalContextList } from '../referential/LegalContext';
import { Matrix, MatrixEffective } from '../referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindEffective
} from '../referential/Matrix/MatrixKind';
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
import { CompanyFixture, genCompany } from './companyFixtures';
import { ValidatedProgrammingPlanFixture } from './programmingPlanFixtures';
import { oneOf } from './testFixtures';
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
  programmingPlanKind: 'PPV',
  context: oneOf(ContextList),
  legalContext: oneOf(LegalContextList),
  resytalId: '23-' + fakerFR.string.numeric(6),
  company: genCompany(),
  notesOnCreation: fakerFR.string.alphanumeric(32),
  status: 'Draft',
  ...data
});
export const genCreatedSampleData = (
  data?: Partial<CreatedSampleData>
): CreatedSampleData => ({
  region: '44',
  reference: `GES-${oneOf(Regions['44'].departments)}-24-${fakerFR.number.int(9999)}-${oneOf(LegalContextList)}`,
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
  const contextData = genSampleContextData(
    SampleContextData.partial().parse(data ?? {})
  );
  return {
    ...contextData,
    ...genCreatedSampleData(data),
    company: genCompany(),
    matrixKind: oneOf(MatrixKindEffective.options),
    matrix: oneOf(MatrixEffective.options),
    matrixPart: oneOf(MatrixPartList),
    stage: oneOf(StageList),
    specificData: {
      programmingPlanKind: 'PPV',
      cultureKind: oneOf(CultureKindList),
      releaseControl: fakerFR.datatype.boolean()
    },
    items: [genSampleItem({ sampleId: contextData.id, itemNumber: 1 })],
    ...data
  };
};
export const genCreatedSample = (data?: Partial<Sample>): Sample => {
  const sample = genCreatedPartialSample(data);
  return Sample.parse({
    ...sample,
    geolocation: sample.geolocation as Geolocation,
    company: sample.company as Company,
    matrixKind: sample.matrixKind as MatrixKind,
    matrix: sample.matrix as Matrix,
    matrixPart: sample.matrixPart as MatrixPart,
    stage: sample.stage as Stage,
    prescriptionId: uuidv4(),
    laboratoryId: uuidv4(),
    items: sample.items as SampleItem[],
    ownerAgreement: fakerFR.datatype.boolean(),
    ...data
  });
};
export const genSampleItem = (data?: Partial<SampleItem>): SampleItem => ({
  sampleId: uuidv4(),
  itemNumber: fakerFR.number.int(99),
  quantity: fakerFR.number.int(999),
  quantityUnit: oneOf(QuantityUnitList),
  compliance200263: fakerFR.datatype.boolean(),
  sealId: fakerFR.string.alphanumeric(32),
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
  region: '44',
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  legalContext: 'A',
  resytalId: '23-123456',
  company: CompanyFixture,
  notesOnCreation: 'notes on creation',
  reference: 'GS-08-24-313-A',
  sampler: pick(Sampler1Fixture, ['id', 'firstName', 'lastName']),
  createdAt: new Date('2023-01-02'),
  lastUpdatedAt: new Date('2024-03-04'),
  status: 'DraftMatrix' as const,
  matrix: 'A00GZ',
  matrixPart: 'PART1',
  specificData: {
    programmingPlanKind: 'PPV',
    cultureKind: 'PD07A',
    releaseControl: false
  },
  stage: 'STADE7',
  items: [Sample1Item1Fixture]
});
export const Sample12Fixture = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '11111111-2222-2222-2222-222222222222',
  status: 'Draft' as const,
  department: '88',
  region: Region1Fixture,
  reference: 'GES-08-24-314-A'
});
export const Sample13Fixture = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '11111111-3333-3333-3333-333333333333',
  status: 'Sent' as const,
  department: '88',
  region: Region1Fixture,
  reference: 'GES-08-24-315-A'
});
export const Sample2Fixture = genCreatedPartialSample({
  sampler: Sampler2Fixture,
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '22222222-2222-2222-2222-222222222222',
  status: 'DraftMatrix' as const,
  department: '53',
  region: Region2Fixture,
  reference: 'PDL-08-24-313-A'
});
