import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { DepartmentList } from '../schema/Department';
import { Prescription } from '../schema/Prescription/Prescription';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { RegionList } from '../schema/Region';
import { CreatedSample, Sample, SampleToCreate } from '../schema/Sample/Sample';
import { SampleLegalContextList } from '../schema/Sample/SampleLegalContext';
import { SampleStage, SampleStageList } from '../schema/Sample/SampleStage';
import { SampleStorageConditionList } from '../schema/Sample/SampleStorageCondition';
import { AuthUser } from '../schema/User/AuthUser';
import { User } from '../schema/User/User';
import { UserRole, UserRoleList } from '../schema/User/UserRole';

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

export const genUser = (role?: UserRole): User => ({
  id: uuidv4(),
  email: genEmail(),
  // password: randomstring.generate(),
  role: role ?? oneOf(UserRoleList),
});

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: uuidv4(),
  };
}

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
  planningContext: oneOf(ProgrammingPlanKindList),
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

export const genProgrammingPlan = (userId?: string) => ({
  id: uuidv4(),
  title: randomstring.generate(),
  createdAt: new Date(),
  createdBy: userId ?? uuidv4(),
  kind: oneOf(ProgrammingPlanKindList),
});

export const genPrescriptions = (
  programmingPlanId: string,
  matrix?: string,
  stage?: string,
  countArray?: number[]
): Prescription[] =>
  (countArray ?? new Array(18).fill(genNumber(1))).map((count, index) => ({
    id: uuidv4(),
    programmingPlanId,
    region: RegionList[index],
    sampleMatrix: matrix ?? randomstring.generate(),
    sampleStage: (stage as SampleStage) ?? oneOf(SampleStageList),
    sampleCount: count,
  }));
