import { fakerFR as faker } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { MatrixKindList, MatrixList, MatrixPartList } from '../foodex2/Matrix';
import { Document } from '../schema/Document/Document';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { Prescription } from '../schema/Prescription/Prescription';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionList, Regions } from '../schema/Region';
import { CreatedSample, Sample, SampleToCreate } from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
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

export const genUser = (...roles: UserRole[]): User => ({
  id: uuidv4(),
  password: randomstring.generate(),
  email: genEmail(),
  roles: roles ?? [oneOf(UserRoleList)],
  region:
    roles?.includes('NationalCoordinator') || roles?.includes('Administrator')
      ? null
      : oneOf(RegionList),
});

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: uuidv4(),
  };
}

export const genSampleToCreate = (
  programmingPlanId?: string
): SampleToCreate => ({
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
  programmingPlanId: programmingPlanId ?? uuidv4(),
  legalContext: oneOf(SampleLegalContextList),
  department: oneOf(Regions['44'].departments),
});

export const genCreatedSample = (
  userId?: string,
  programmingPlanId?: string
): CreatedSample => ({
  id: uuidv4(),
  reference: `44-${oneOf(Regions['44'].departments)}-24-${genNumber(4)}-${oneOf(
    SampleLegalContextList
  )}`,
  createdBy: userId ?? uuidv4(),
  createdAt: new Date(),
  lastUpdatedAt: new Date(),
  status: 'DraftInfos',
  ...genSampleToCreate(programmingPlanId),
});

export const genSample = (
  userId?: string,
  programmingPlanId?: string
): Sample => {
  const sample = genCreatedSample(userId, programmingPlanId);

  return {
    ...sample,
    locationSiret: String(genSiret()),
    locationName: faker.company.name(),
    locationAddress: faker.location.streetAddress({ useFullAddress: true }),
    matrixKind: oneOf(MatrixKindList),
    matrix: oneOf(MatrixList),
    matrixPart: oneOf(MatrixPartList),
    stage: oneOf(SampleStageList),
    cultureKind: oneOf(['Bio', 'Conventionnel']),
    storageCondition: oneOf(SampleStorageConditionList),
    releaseControl: genBoolean(),
    temperatureMaintenance: genBoolean(),
    expiryDate: new Date(),
    items: [genSampleItem(sample.id, 1)],
  };
};

export const genSampleItem = (
  sampleId: string,
  itemNumber?: number
): SampleItem => ({
  sampleId,
  itemNumber: itemNumber ?? genNumber(2),
  quantity: genNumber(3),
  quantityUnit: oneOf(['g', 'kg', 'L', 'mL']),
  compliance200263: genBoolean(),
  pooling: genBoolean(),
  poolingCount: genNumber(6),
  sealId: randomstring.generate(),
});

export const genCoords = () => ({
  coords: {
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
  },
});

export const genProgrammingPlan = (userId?: string): ProgrammingPlan => ({
  id: uuidv4(),
  title: randomstring.generate(),
  createdAt: new Date(),
  createdBy: userId ?? uuidv4(),
  kind: oneOf(ProgrammingPlanKindList),
  status: oneOf(ProgrammingPlanStatusList),
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

export const genDocument = (userId: string): Document => ({
  id: uuidv4(),
  filename: randomstring.generate(),
  createdAt: new Date(),
  createdBy: userId,
});

export const genLaboratory = (): Laboratory => ({
  id: uuidv4(),
  name: randomstring.generate(),
});
