import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { CultureKindList } from '../referential/CultureKind';
import { LegalContextList } from '../referential/LegalContext';
import { Matrix, MatrixList } from '../referential/Matrix/Matrix';
import { MatrixPart, MatrixPartList } from '../referential/MatrixPart';
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
  SampleContextData,
} from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
import { genCompany } from './companyFixtures';
import { genBoolean, genNumber, oneOf } from './testFixtures';

export const genSampleContextData = (
  data?: Partial<SampleContextData>
): SampleContextData => ({
  id: uuidv4(),
  sampledAt: new Date(),
  department: oneOf(Regions['44'].departments),
  geolocation: {
    x: 48.8566,
    y: 2.3522,
  },
  programmingPlanId: uuidv4(),
  context: oneOf(ContextList),
  legalContext: oneOf(LegalContextList),
  resytalId:
    '23-' +
    randomstring.generate({
      length: 6,
      charset: '123456789',
    }),
  company: genCompany(),
  notesOnCreation: randomstring.generate(),
  status: 'Draft',
  ...data,
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
    lastName: fakerFR.person.lastName(),
  },
  createdAt: new Date(),
  lastUpdatedAt: new Date(),
  ...data,
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
    ...data,
  };
};
export const genCreatedSample = (data?: Partial<Sample>): Sample => {
  const sample = genCreatedPartialSample(data);
  return {
    ...sample,
    geolocation: sample.geolocation as Geolocation,
    company: sample.company as Company,
    matrix: sample.matrix as Matrix,
    matrixPart: sample.matrixPart as MatrixPart,
    stage: sample.stage as Stage,
    prescriptionId: uuidv4(),
    laboratoryId: uuidv4(),
    items: sample.items as SampleItem[],
    ...data,
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
  ...data,
});
