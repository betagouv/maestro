import { fakerFR as faker, fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Matrix, MatrixList } from '../referential/Matrix/Matrix';
import { RegionList, Regions } from '../referential/Region';
import { Stage, StageList } from '../referential/Stage';
import { AnalysisKindList } from '../schema/Analysis/AnalysisKind';
import { Company } from '../schema/Company/Company';
import { CompanySearchResult } from '../schema/Company/CompanySearchResult';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { Prescription } from '../schema/Prescription/Prescription';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
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
