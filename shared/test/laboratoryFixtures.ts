import { fakerFR } from '@faker-js/faker';
import type {
  Laboratory,
  LaboratoryWithSacha
} from '../schema/Laboratory/Laboratory';

export const genLaboratory = (
  data?: Partial<Laboratory>
): LaboratoryWithSacha => ({
  id: crypto.randomUUID(),
  shortName: 'GIR 49',
  name: fakerFR.company.name(),
  address: fakerFR.location.streetAddress(),
  postalCode: fakerFR.location.zipCode('#####'),
  city: fakerFR.location.city(),
  emails: [fakerFR.internet.email()],
  emailsAnalysisResult: [],
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
