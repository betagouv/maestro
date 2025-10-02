import {
  CAP29Id,
  CER30Id,
  GIR49Id,
  LDA66Id,
  LDA72Id,
  SCL34Id,
  SCL91Id
} from 'maestro-shared/schema/User/User';
import { Laboratories } from '../../../repositories/laboratoryRepository';

const EMAIL_SANBOX = 'preleveur@maestro.beta.gouv.fr';
export const seed = async function () {
  await Laboratories().insert([
    {
      id: SCL34Id,
      shortName: 'SCL 34',
      name: 'SCL Montpellier',
      address: '205, Rue de la Croix Verte',
      postalCode: '34090',
      city: 'Montpellier',
      emails: [EMAIL_SANBOX]
    },
    {
      id: LDA66Id,
      shortName: 'LDA 66',
      name: 'CAMP',
      address: '5002F, Rambla de la Thermodynamique',
      postalCode: '66100',
      city: 'Perpignan',
      emails: [EMAIL_SANBOX]
    },
    {
      id: LDA72Id,
      shortName: 'LDA 72',
      name: 'Inovalys',
      address: '128, rue de Beaugé',
      postalCode: '72018',
      city: 'LE MANS Cedex 2',
      emails: [EMAIL_SANBOX]
    },
    {
      id: SCL91Id,
      shortName: 'SCL 91',
      name: "SCL d'Ile de France",
      address: '25, avenue de la République',
      postalCode: '91300',
      city: 'MASSY',
      emails: [EMAIL_SANBOX]
    },
    {
      id: GIR49Id,
      shortName: 'GIR 49',
      name: 'GIRPA',
      address: "9, avenue du Bois l'Abbé",
      postalCode: '49070',
      city: 'Beaucouzé',
      emails: [EMAIL_SANBOX]
    },
    {
      id: CAP29Id,
      shortName: 'CAP 29',
      name: 'Capinov',
      address: 'ZI de Lanrinou',
      postalCode: '29800',
      city: 'Landerneau',
      emails: [EMAIL_SANBOX]
    },
    {
      id: CER30Id,
      shortName: 'CER 30',
      name: 'CERECO',
      address: '3, rue Pierre Bautias ZA Aéropôle',
      postalCode: '30128',
      city: 'Garons',
      emails: [EMAIL_SANBOX]
    }
  ]);
};
