import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { SSD2Ids } from '../referential/Residue/SSD2Id';
import { AnalysisMethod } from '../schema/Analysis/AnalysisMethod';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { LaboratoryAnalyticalCompetence } from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import { LaboratoryAnalyticalMethod } from '../schema/Laboratory/LaboratoryAnalyticalMethod';
import { LaboratoryValidationMethod } from '../schema/Laboratory/LaboratoryValidationMethod';
import { oneOf } from './testFixtures';

export const genLaboratory = (data?: Partial<Laboratory>): Laboratory => ({
  id: uuidv4(),
  shortName: 'GIR 49',
  name: fakerFR.company.name(),
  address: fakerFR.location.streetAddress(),
  postalCode: fakerFR.location.zipCode('#####'),
  city: fakerFR.location.city(),
  emails: [fakerFR.internet.email()],
  ...data
});

export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111'
});

export const genLaboratoryAnalyticalCompetence = (
  data?: Partial<LaboratoryAnalyticalCompetence>
): LaboratoryAnalyticalCompetence => ({
  id: uuidv4(),
  laboratoryId: uuidv4(),
  residueReference: oneOf(SSD2Ids),
  analyteReference: oneOf(SSD2Ids),
  analyticalMethod: oneOf(LaboratoryAnalyticalMethod.options),
  validationMethod: oneOf(LaboratoryValidationMethod.options),
  analysisMethod: oneOf(AnalysisMethod.options),
  isCompleteDefinitionAnalysis: true,
  detectionLimit: fakerFR.number.float({
    min: 0,
    max: 10,
    fractionDigits: 2
  }),
  quantificationLimit: fakerFR.number.float({
    min: 1,
    max: 10,
    fractionDigits: 2
  }),
  ...data
});

export const Laboratory1AnalyticalCompetenceFixture1 =
  genLaboratoryAnalyticalCompetence({
    laboratoryId: LaboratoryFixture.id
  });

export const Laboratory1AnalyticalCompetenceFixture2 =
  genLaboratoryAnalyticalCompetence({
    laboratoryId: LaboratoryFixture.id
  });
