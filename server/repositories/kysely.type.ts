/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Point = {
  x: number;
  y: number;
};

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Analysis {
  compliance: boolean | null;
  createdAt: Generated<Timestamp | null>;
  createdBy: string | null;
  id: Generated<string>;
  notesOnCompliance: string | null;
  reportDocumentId: string | null;
  sampleId: string | null;
  status: string;
}

export interface AnalysisResidues {
  analysisId: string;
  analysisMethod: string;
  compliance: string | null;
  kind: string | null;
  lmr: number | null;
  notesOnPollutionRisk: string | null;
  notesOnResult: string | null;
  otherCompliance: string | null;
  pollutionRisk: string | null;
  reference: string | null;
  residueNumber: number;
  result: number | null;
  resultHigherThanArfd: string | null;
  resultKind: string | null;
  substanceApproved: string | null;
  substanceAuthorised: string | null;
}

export interface Companies {
  address: string | null;
  city: string | null;
  nafCode: string | null;
  name: string;
  postalCode: string | null;
  siret: string;
  tradeName: string | null;
}

export interface Documents {
  createdAt: Generated<Timestamp | null>;
  createdBy: string | null;
  filename: string;
  id: Generated<string>;
  kind: string;
}

export interface KnexMigrations {
  batch: number | null;
  id: Generated<number>;
  migrationTime: Timestamp | null;
  name: string | null;
}

export interface KnexMigrationsLock {
  index: Generated<number>;
  isLocked: number | null;
}

export interface Laboratories {
  email: string;
  id: Generated<string>;
  name: string;
}

export interface Prescriptions {
  context: string | null;
  id: Generated<string>;
  matrixKind: string | null;
  notes: string | null;
  programmingPlanId: string | null;
  stages: string[] | null;
}

export interface PrescriptionSubstances {
  analysisMethod: string;
  prescriptionId: string;
  substanceCode: string;
}

export interface ProgrammingPlanRegionalStatus {
  programmingPlanId: string;
  region: string;
  status: string | null;
}

export interface ProgrammingPlans {
  createdAt: Generated<Timestamp | null>;
  createdBy: string | null;
  id: Generated<string>;
  year: number;
}

export interface RegionalPrescriptionComments {
  comment: string;
  createdAt: Generated<Timestamp | null>;
  createdBy: string;
  id: Generated<string>;
  prescriptionId: string;
  region: string;
}

export interface RegionalPrescriptions {
  laboratoryId: string | null;
  prescriptionId: string;
  region: string;
  sampleCount: number | null;
}

export interface ResidueAnalytes {
  analysisId: string;
  analyteNumber: number;
  reference: string | null;
  residueNumber: number;
  result: number | null;
  resultKind: string | null;
}

export interface SampleItems {
  compliance200263: boolean | null;
  itemNumber: number;
  quantity: number | null;
  quantityUnit: string | null;
  recipientKind: string | null;
  sampleId: string;
  sealId: string | null;
  supportDocumentId: string | null;
}

export interface Samples {
  companyOffline: string | null;
  companySiret: string | null;
  context: string;
  createdAt: Generated<Timestamp | null>;
  cultureKind: string | null;
  department: string | null;
  geolocation: Point | null;
  id: Generated<string>;
  laboratoryId: string | null;
  lastUpdatedAt: Generated<Timestamp | null>;
  legalContext: string;
  matrix: string | null;
  matrixDetails: string | null;
  matrixKind: string | null;
  matrixPart: string | null;
  notesOnAdmissibility: string | null;
  notesOnCreation: string | null;
  notesOnItems: string | null;
  notesOnMatrix: string | null;
  notesOnOwnerAgreement: string | null;
  ownerAgreement: boolean | null;
  ownerEmail: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  parcel: string | null;
  prescriptionId: string | null;
  programmingPlanId: string | null;
  receivedAt: Timestamp | null;
  reference: string;
  region: string;
  releaseControl: boolean | null;
  resytalId: string | null;
  sampledAt: Timestamp;
  sampledBy: string | null;
  sentAt: Timestamp | null;
  stage: string | null;
  status: string;
}

export interface SampleSequenceNumbers {
  nextSequence: Generated<number>;
  programmingPlanYear: number;
  region: string;
}

export interface Substances {
  code: string;
  label: string;
}

export interface Users {
  email: string;
  firstName: string;
  id: Generated<string>;
  lastName: string;
  region: string | null;
  roles: string[];
}

export interface DB {
  analysis: Analysis;
  analysisResidues: AnalysisResidues;
  companies: Companies;
  documents: Documents;
  knexMigrations: KnexMigrations;
  knexMigrationsLock: KnexMigrationsLock;
  laboratories: Laboratories;
  prescriptions: Prescriptions;
  prescriptionSubstances: PrescriptionSubstances;
  programmingPlanRegionalStatus: ProgrammingPlanRegionalStatus;
  programmingPlans: ProgrammingPlans;
  regionalPrescriptionComments: RegionalPrescriptionComments;
  regionalPrescriptions: RegionalPrescriptions;
  residueAnalytes: ResidueAnalytes;
  sampleItems: SampleItems;
  samples: Samples;
  sampleSequenceNumbers: SampleSequenceNumbers;
  substances: Substances;
  users: Users;
}
