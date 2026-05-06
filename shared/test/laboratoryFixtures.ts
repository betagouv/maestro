import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { SSD2Ids } from '../referential/Residue/SSD2Id';
import { AnalysisMethod } from '../schema/Analysis/AnalysisMethod';
import type {
  Laboratory,
  LaboratoryWithSacha
} from '../schema/Laboratory/Laboratory';
import type { LaboratoryAnalyticalCompetence } from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import { LaboratoryAnalyticalMethod } from '../schema/Laboratory/LaboratoryAnalyticalMethod';
import { LaboratoryValidationMethod } from '../schema/Laboratory/LaboratoryValidationMethod';
import { oneOf } from './testFixtures';

export const genLaboratory = (
  data?: Partial<Laboratory>
): LaboratoryWithSacha => ({
  id: uuidv4(),
  shortName: 'GIR 49',
  name: fakerFR.company.name(),
  address: fakerFR.location.streetAddress(),
  postalCode: fakerFR.location.zipCode('#####'),
  city: fakerFR.location.city(),
  emails: [fakerFR.internet.email()],
  legacyDai: false,
  sacha: { activated: false, sigle: null, communication: null },
  ...data
});

export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111'
});

const labData: Array<Pick<Laboratory, 'shortName' | 'name'>> = [
  {
    shortName: 'ANS 94a - LNR ETM',
    name: 'LNR ETM - Laboratoire de sécurité des aliments de Maisons-Alfort'
  },
  {
    shortName: 'ANS 94a - LNR PEST',
    name: 'LNR PESTICIDES Laboratoire de sécurité des aliments de Maisons-Alfort'
  },
  { shortName: 'CAP 29', name: 'Capinov' },
  { shortName: 'CER 30', name: 'CERECO' },
  { shortName: 'GIR 49', name: 'GIRPA' },
  { shortName: 'LDA 17', name: 'QUALYSE site de La Rochelle' },
  { shortName: 'LDA 21', name: "Laboratoire Départemental de la Côte-d'Or" },
  { shortName: 'LDA 22', name: 'LABOCEA' },
  {
    shortName: 'LDA 31',
    name: 'Laboratoire départemental Eau - Vétérinaire - Air LAUNAGUET'
  },
  { shortName: 'LDA 66', name: 'CAMP' },
  { shortName: 'LDA 72', name: 'Inovalys' },
  {
    shortName: 'LDA 85',
    name: "Laboratoire de l'Environnement et de l'Alimentation de la Vendée (LEAV)"
  },
  {
    shortName: 'LDA 87',
    name: "Laboratoire Départemental d'Analyses et de Recherches de la Haute-Vienne"
  },
  { shortName: 'SCL 34', name: 'SCL Montpellier' },
  { shortName: 'SCL 91', name: "SCL d'Ile de France" }
];

export const LaboratoryListFixture: Laboratory[] = labData.map((lab) =>
  genLaboratory(lab)
);

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
  isCompleteDefinitionAnalysis: 'true',
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
  lastUpdatedAt: new Date(),
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
