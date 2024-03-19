import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { UserApi } from '../../server/models/UserApi';
import { DepartmentList } from '../schema/Department';
import { CreatedSample, Sample, SampleToCreate } from '../schema/Sample/Sample';
import { SampleLegalContextList } from '../schema/Sample/SampleLegalContext';
import { SamplePlanningContextList } from '../schema/Sample/SamplePlanningContext';
import { SampleStageList } from '../schema/Sample/SampleStage';
import { SampleStorageConditionList } from '../schema/Sample/SampleStorageCondition';

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

export const genSiret = () =>
  randomstring.generate({
    length: 14,
    charset: '123456789',
  });

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
  sampledAt: new Date(),
  resytalId:
    '22' +
    randomstring.generate({
      length: 6,
      charset: '123456789',
    }),
  planningContext: oneOf(SamplePlanningContextList),
  legalContext: oneOf(SampleLegalContextList),
  department: oneOf(DepartmentList),
});

export const genCreatedSample = (userId?: string): CreatedSample => ({
  id: uuidv4(),
  reference: `GES-${oneOf(DepartmentList)}-${genNumber(4)}`,
  createdBy: userId ?? uuidv4(),
  createdAt: new Date(),
  status: 'Draft',
  ...genSampleToCreate(),
});

export const genSample = (userId?: string): Sample => ({
  ...genCreatedSample(userId),
  locationSiret: String(genSiret()),
  locationName: randomstring.generate(),
  locationAddress: randomstring.generate(),
  matrixKind: randomstring.generate(),
  matrix: randomstring.generate(),
  matrixPart: randomstring.generate(),
  stage: oneOf(SampleStageList),
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

export const genCoords = () => ({
  coords: {
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
  },
});
