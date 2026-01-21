import type { Meta } from '@storybook/react-vite';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';

const mockSachaCommemoratifs: SachaCommemoratifRecord = {
  ['SIGLE_1' as CommemoratifSigle]: {
    cle: '001',
    sigle: 'SIGLE_1' as CommemoratifSigle,
    libelle: 'Premier commémoratif',
    statut: 'V',
    typeDonnee: 'V',
    unite: null,
    values: {
      ['VAL_1' as CommemoratifValueSigle]: {
        cle: '001-1',
        sigle: 'VAL_1' as CommemoratifValueSigle,
        libelle: 'Valeur 1',
        statut: 'V'
      }
    }
  },
  ['SIGLE_2' as CommemoratifSigle]: {
    cle: '002',
    sigle: 'SIGLE_2' as CommemoratifSigle,
    libelle: 'Deuxième commémoratif',
    statut: 'V',
    typeDonnee: 'N',
    unite: null,
    values: {}
  },
  ['SIGLE_3' as CommemoratifSigle]: {
    cle: '003',
    sigle: 'SIGLE_3' as CommemoratifSigle,
    libelle: 'Troisième commémoratif',
    statut: 'V',
    typeDonnee: null,
    unite: null,
    values: {}
  }
};

const meta = {
  title: 'Views/SachaView/CommemoratifSigleForm',
  component: CommemoratifSigleForm
} satisfies Meta<typeof CommemoratifSigleForm>;

export default meta;

export const DAOABreeding = {
  render: () => (
    <CommemoratifSigleForm
      attribute="breedingMethod"
      programmingPlanKind="DAOA_BREEDING"
      sachaCommemoratifs={mockSachaCommemoratifs}
    />
  )
};

export const DAOASlaughter = {
  render: () => (
    <CommemoratifSigleForm
      attribute="animalKind"
      programmingPlanKind="DAOA_SLAUGHTER"
      sachaCommemoratifs={mockSachaCommemoratifs}
    />
  )
};
