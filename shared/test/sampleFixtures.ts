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
import {
  CreatedSample,
  PartialSample,
  Sample,
  SampleToCreate,
} from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
import { User } from '../schema/User/User';
import { genBoolean, genCompany, genNumber, oneOf } from './testFixtures';

export const genSampleToCreate = (
  programmingPlanId?: string
): SampleToCreate => ({
  sampledAt: new Date(),
  department: oneOf(Regions['44'].departments),
  geolocation: {
    x: 48.8566,
    y: 2.3522,
  },
  programmingPlanId: programmingPlanId ?? uuidv4(),
  legalContext: oneOf(LegalContextList),
  resytalId:
    '23-' +
    randomstring.generate({
      length: 6,
      charset: '123456789',
    }),
  company: genCompany(),
  notesOnCreation: randomstring.generate(),
});
export const genCreatedSample = (
  user?: User,
  programmingPlanId?: string
): CreatedSample => ({
  id: uuidv4(),
  reference: `44-${oneOf(Regions['44'].departments)}-24-${genNumber(4)}-${oneOf(
    LegalContextList
  )}`,
  sampler: {
    id: user?.id ?? uuidv4(),
    firstName: user?.firstName ?? fakerFR.person.firstName(),
    lastName: user?.lastName ?? fakerFR.person.lastName(),
  },
  createdAt: new Date(),
  lastUpdatedAt: new Date(),
  status: 'DraftMatrix',
  ...genSampleToCreate(programmingPlanId),
});
export const genPartialSample = (
  user?: User,
  programmingPlanId?: string,
  company?: Company
): PartialSample => {
  const sample = genCreatedSample(user, programmingPlanId);
  return {
    ...sample,
    company: company ?? genCompany(),
    matrix: oneOf(MatrixList),
    matrixPart: oneOf(MatrixPartList),
    stage: oneOf(StageList),
    cultureKind: oneOf(CultureKindList),
    releaseControl: genBoolean(),
    items: [genSampleItem(sample.id, 1)],
  };
};
export const genSample = (
  user?: User,
  programmingPlanId?: string,
  company?: Company
): Sample => {
  const sample = genPartialSample(user, programmingPlanId, company);
  return {
    ...sample,
    matrix: sample.matrix as Matrix,
    matrixPart: sample.matrixPart as MatrixPart,
    stage: sample.stage as Stage,
    laboratoryId: uuidv4(),
    items: sample.items as SampleItem[],
  };
};
export const genSampleItem = (
  sampleId: string,
  itemNumber?: number
): SampleItem => ({
  sampleId,
  itemNumber: itemNumber ?? genNumber(2),
  quantity: genNumber(3),
  quantityUnit: oneOf(QuantityUnitList),
  compliance200263: genBoolean(),
  sealId: randomstring.generate(),
  recipientKind: 'Laboratory',
});
