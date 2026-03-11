import type { Meta } from '@storybook/react-vite';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import {
  DAOABreedingFieldConfigs,
  DAOASlaughterFieldConfigs
} from 'maestro-shared/test/specificDataFixtures';
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

export const DAOAVolaille = {
  render: () => (
    <CommemoratifSigleForm
      fieldConfig={
        DAOABreedingFieldConfigs.find((c) => c.field.key === 'breedingMethod')!
          .field
      }
      sachaCommemoratifs={mockSachaCommemoratifs}
      sampleSpecifiDataRecord={{}}
    />
  )
};

export const DAOABovin = {
  render: () => (
    <CommemoratifSigleForm
      fieldConfig={
        DAOASlaughterFieldConfigs.find((c) => c.field.key === 'animalKind')!
          .field
      }
      sachaCommemoratifs={mockSachaCommemoratifs}
      sampleSpecifiDataRecord={{}}
    />
  )
};
