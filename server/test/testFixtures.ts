import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { DepartmentList } from '../../shared/schema/Department';
import { Sample, SampleToCreate } from '../../shared/schema/Sample';
import { SampleContextList } from '../../shared/schema/SampleContext';
import { SampleStorageConditionList } from '../../shared/schema/SampleStorageCondition';
import { UserApi } from '../models/UserApi';

export const genEmail = () => {
  return (
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '@' +
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '.' +
    randomstring.generate({
      length: 2,
      charset: 'alphabetic',
    })
  );
};

export const genNumber = (length = 10) => {
  return Number(
    randomstring.generate({
      length,
      charset: 'numeric',
    })
  );
};

export const genBoolean = () => Math.random() < 0.5;

export const genSiret = () => genNumber(14);

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const genValidPassword = () => '123Valid';

export const genUserApi = (): UserApi => ({
  id: uuidv4(),
  email: genEmail(),
  password: randomstring.generate(),
});

export const genSampleToCreate = (): SampleToCreate => ({
  userLocation: {
    x: 48.8566,
    y: 2.3522,
  },
  resytalId: '22' + genNumber(6),
  context: oneOf(SampleContextList),
  department: oneOf(DepartmentList),
});

export const genSample = (userId?: string): Sample => ({
  id: uuidv4(),
  reference: `GES-${oneOf(DepartmentList)}-${genNumber(4)}`,
  createdAt: new Date(),
  createdBy: userId ?? uuidv4(),
  ...genSampleToCreate(),
  locationSiret: String(genSiret()),
  locationName: randomstring.generate(),
  locationAddress: randomstring.generate(),
  matrix: randomstring.generate(),
  matrixKind: randomstring.generate(),
  matrixPart: randomstring.generate(),
  quantity: genNumber(),
  quantityUnit: randomstring.generate(),
  cultureKind: randomstring.generate(),
  compliance200263: genBoolean(),
  storageCondition: oneOf(SampleStorageConditionList),
  pooling: genBoolean(),
  releaseControl: genBoolean(),
  sampleCount: genNumber(1),
  temperatureMaintenance: genBoolean(),
  expiryDate: new Date(),
  sealId: genNumber(4),
});
