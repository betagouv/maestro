import { fakerFR as faker, fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { CultureKindList } from '../referential/CultureKind';
import { LegalContextList } from '../referential/LegalContext';
import { Matrix, MatrixList } from '../referential/Matrix/Matrix';
import { MatrixPart, MatrixPartList } from '../referential/MatrixPart';
import { QuantityUnitList } from '../referential/QuantityUnit';
import { RegionList, Regions } from '../referential/Region';
import { Stage, StageList } from '../referential/Stage';
import { AnalysisKindList } from '../schema/Analysis/AnalysisKind';
import { Company } from '../schema/Company/Company';
import { CompanySearchResult } from '../schema/Company/CompanySearchResult';
import { Document } from '../schema/Document/Document';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { Prescription } from '../schema/Prescription/Prescription';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  CreatedSample,
  PartialSample,
  Sample,
  SampleToCreate,
} from '../schema/Sample/Sample';
import { SampleItem } from '../schema/Sample/SampleItem';
import { Substance } from '../schema/Substance/Substance';
import { SubstanceAnalysis } from '../schema/Substance/SubstanceAnalysis';
import { AuthUser } from '../schema/User/AuthUser';
import { User } from '../schema/User/User';
import { UserRole, UserRoleList } from '../schema/User/UserRole';

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
  email: fakerFR.internet.email(),
  password: randomstring.generate(),
  firstName: fakerFR.person.firstName(),
  lastName: fakerFR.person.lastName(),
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
  matrix?: Matrix,
  stages?: string[],
  countArray?: number[],
  laboratoryId?: string
): Prescription[] =>
  (countArray ?? new Array(18).fill(genNumber(1))).map((count, index) => ({
    id: uuidv4(),
    programmingPlanId,
    region: RegionList[index],
    matrix: matrix ?? oneOf(MatrixList),
    stages: (stages as Stage[]) ?? [oneOf(StageList)],
    sampleCount: count,
    laboratoryId,
  }));

export const genDocument = (userId: string): Document => ({
  id: uuidv4(),
  filename: randomstring.generate(),
  createdAt: new Date(),
  createdBy: userId,
  kind: 'OverviewDocument',
});

export const genLaboratory = (): Laboratory => ({
  id: uuidv4(),
  name: randomstring.generate(),
  email: fakerFR.internet.email(),
});

export const genCompany = (): Company => ({
  siret: genSiret(),
  name: fakerFR.company.name(),
  address: faker.location.streetAddress({ useFullAddress: true }),
  postalCode: faker.location.zipCode(),
});

export const genCompanySearchResult = (): CompanySearchResult => ({
  siren: genSiret().substring(0, 9),
  nom_complet: fakerFR.company.name(),
  nom_raison_sociale: fakerFR.company.name(),
  sigle: fakerFR.company.buzzNoun(),
  siege: {
    activite_principale: fakerFR.commerce.department(),
    adresse: fakerFR.location.streetAddress(),
    code_postal: fakerFR.location.zipCode(),
    commune: fakerFR.location.city(),
    complement_adresse: fakerFR.location.secondaryAddress(),
    departement: oneOf(Regions['44'].departments),
    libelle_commune: fakerFR.location.city(),
    libelle_voie: fakerFR.location.street(),
    numero_voie: fakerFR.location.buildingNumber(),
    region: oneOf(RegionList),
    siret: genSiret(),
  },
  activite_principale: faker.commerce.department(),
});

export const genSubstance = (): Substance => ({
  code: randomstring.generate(),
  label: randomstring.generate(),
});

export const genSubstanceAnalysis = (
  data: Partial<SubstanceAnalysis>
): SubstanceAnalysis => ({
  matrix: oneOf(MatrixList),
  substance: genSubstance(),
  kind: oneOf(AnalysisKindList),
  year: 2024,
  ...data,
});
