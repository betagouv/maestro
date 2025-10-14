import { fakerFR } from '@faker-js/faker';
import { pick } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { CultureKindList } from '../referential/CultureKind';
import { LegalContextList } from '../referential/LegalContext';
import { Matrix, MatrixEffective } from '../referential/Matrix/Matrix';
import { MatrixKind } from '../referential/Matrix/MatrixKind';
import { MatrixPartList } from '../referential/Matrix/MatrixPart';
import { QuantityUnitList } from '../referential/QuantityUnit';
import { Regions } from '../referential/Region';
import { Company } from '../schema/Company/Company';
import { ProgrammingPlanContextList } from '../schema/ProgrammingPlan/Context';
import {
  CreatedSampleData,
  Geolocation,
  PartialSample,
  Sample,
  SampleContextData
} from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
import { SubstanceKindList } from '../schema/Substance/SubstanceKind';
import { DummyLaboratoryIds } from '../schema/User/User';
import { CompanyFixture, genCompany } from './companyFixtures';
import { PrescriptionFixture } from './prescriptionFixtures';
import { PPVValidatedProgrammingPlanFixture } from './programmingPlanFixtures';
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
  sampler: {
    id: uuidv4(),
    name: fakerFR.person.fullName()
  },
  geolocation: {
    x: 49.788805,
    y: 4.731044
  },
  programmingPlanId: uuidv4(),
  context: oneOf(ProgrammingPlanContextList),
  legalContext: oneOf(LegalContextList),
  resytalId: '23-' + fakerFR.string.numeric(6),
  company: genCompany(),
  notesOnCreation: fakerFR.string.alphanumeric(32),
  status: 'Draft',
  specificData: {
    programmingPlanKind: 'PPV'
  },
  ...data
});
export const genCreatedSampleData = (
  data?: Partial<CreatedSampleData>
): CreatedSampleData => ({
  region: '44',
  reference: `GES-${oneOf(Regions['44'].departments)}-24-${fakerFR.number.int(9999)}-${oneOf(LegalContextList)}`,
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
    matrix: oneOf(MatrixEffective.options),
    monoSubstances: [],
    multiSubstances: [],
    stage: 'STADE1',
    specificData: {
      programmingPlanKind: 'PPV',
      matrixPart: oneOf(MatrixPartList),
      cultureKind: oneOf(CultureKindList),
      releaseControl: fakerFR.datatype.boolean()
    },
    sampledAt: new Date(),
    items: [genSampleItem({ sampleId: contextData.id, copyNumber: 1 })],
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
    prescriptionId: uuidv4(),
    items: sample.items as SampleItem[],
    ownerAgreement: fakerFR.datatype.boolean(),
    ...data
  });
};
export const genSampleItem = (data?: Partial<SampleItem>): SampleItem => ({
  sampleId: uuidv4(),
  itemNumber: 1,
  copyNumber: 1,
  quantity: fakerFR.number.int(999),
  quantityUnit: oneOf(QuantityUnitList),
  compliance200263: fakerFR.datatype.boolean(),
  sealId: fakerFR.string.alphanumeric(32),
  recipientKind: 'Laboratory',
  laboratoryId: oneOf(DummyLaboratoryIds),
  substanceKind: oneOf(SubstanceKindList),
  ...data
});
const Sample11FixtureId = '11111111-1111-1111-1111-111111111111';
export const Sample1Item1Fixture = genSampleItem({
  sampleId: Sample11FixtureId,
  copyNumber: 1,
  quantity: 534,
  quantityUnit: 'G185A',
  compliance200263: true,
  sealId: '123456'
});
export const Sample11Fixture = genCreatedPartialSample({
  id: Sample11FixtureId,
  department: '08',
  region: '44',
  geolocation: {
    x: 49.788805,
    y: 4.731044
  },
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
  context: PPVValidatedProgrammingPlanFixture.contexts[0],
  legalContext: 'A',
  resytalId: '23-123456',
  company: CompanyFixture,
  notesOnCreation: 'notes on creation',
  reference: 'GS-08-24-313-A',
  sampler: pick(Sampler1Fixture, ['id', 'name']),
  createdAt: new Date('2023-01-02'),
  lastUpdatedAt: new Date('2024-03-04'),
  status: 'DraftMatrix' as const,
  matrixKind: PrescriptionFixture.matrixKind,
  matrix: 'A00GZ',
  stage: PrescriptionFixture.stages[0],
  specificData: {
    programmingPlanKind: PPVValidatedProgrammingPlanFixture.kinds[0],
    matrixPart: 'PART1',
    cultureKind: 'PD07A',
    releaseControl: false
  },
  prescriptionId: PrescriptionFixture.id,
  sampledAt: new Date('2025-05-06'),
  items: [Sample1Item1Fixture]
});
export const Sample12Fixture = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
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
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
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
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
  context: 'Control',
  company: CompanyFixture,
  id: '22222222-2222-2222-2222-222222222222',
  status: 'DraftMatrix' as const,
  department: '53',
  region: Region2Fixture,
  reference: 'PDL-08-24-313-A'
});
