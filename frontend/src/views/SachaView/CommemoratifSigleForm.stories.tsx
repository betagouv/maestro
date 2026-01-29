import type { Meta } from '@storybook/react-vite';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';

const mockSachaCommemoratifs: SachaCommemoratifRecord = {
  ['SIGLE_1' as CommemoratifSigle]: {
    sigle: 'SIGLE_1' as CommemoratifSigle,
    libelle: 'Premier commémoratif',
    typeDonnee: 'list',
    unite: null,
    values: {
      ['VAL_1' as CommemoratifValueSigle]: {
        sigle: 'VAL_1' as CommemoratifValueSigle,
        libelle: 'Valeur 1'
      }
    }
  },
  ['SIGLE_2' as CommemoratifSigle]: {
    sigle: 'SIGLE_2' as CommemoratifSigle,
    libelle: 'Deuxième commémoratif',
    typeDonnee: 'list',
    unite: null,
    values: {}
  },
  ['SIGLE_3' as CommemoratifSigle]: {
    sigle: 'SIGLE_3' as CommemoratifSigle,
    libelle: 'Troisième commémoratif',
    typeDonnee: 'numeric',
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
      sachaCommemoratifs={mockSachaCommemoratifs}
      sampleSpecifiDataRecord={{}}
    />
  )
};

export const DAOASlaughter = {
  render: () => (
    <CommemoratifSigleForm
      attribute="animalKind"
      sachaCommemoratifs={mockSachaCommemoratifs}
      sampleSpecifiDataRecord={{}}
    />
  )
};
