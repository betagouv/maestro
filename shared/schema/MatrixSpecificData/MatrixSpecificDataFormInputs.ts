import { AnimalSexLabels } from '../../referential/AnimalSex';

import { CultureKindLabels } from '../../referential/CultureKind';
import { MatrixPartLabels } from '../../referential/Matrix/MatrixPart';

import { isNil } from 'lodash-es';
import { AnimalKindLabels } from '../../referential/AnimalKind';
import { BreedingMethodLabels } from '../../referential/BreedingMethod';
import { OutdoorAccessLabels } from '../../referential/OutdoorAccess';
import { ProductionKindLabels } from '../../referential/ProductionKind';
import { SeizureLabels } from '../../referential/Seizure';
import { SpeciesLabels } from '../../referential/Species';
import { SampleMatrixSpecificData } from '../../schema/Sample/SampleMatrixSpecificData';

type UnionKeys<T, O extends string> = T extends any ? keyof Omit<T, O> : never;
export type SampleMatrixSpecificDataKeys = UnionKeys<
  SampleMatrixSpecificData,
  'programmingPlanKind'
>;

export type SpecificDataFormInput = {
  label: string;
  whenValid: string;
  testId?: string;
} & (
  | { inputType: 'text' | 'number'; hintText?: string }
  | { inputType: 'textarea'; hintText?: string; rows?: number }
  | {
      inputType: 'select';
      optionsLabels?: Record<string, string>;
      defaultOptionLabel?: string;
    }
  | { inputType: 'checkbox' }
  | {
      inputType: 'radio';
      optionsLabels: Record<string, string>;
      colSm: 2 | 3 | 4 | 6 | 12;
    }
);

export const getSpecificDataValue = (
  inputKey: SampleMatrixSpecificDataKeys,
  specificData: SampleMatrixSpecificData
): string | null => {
  const value = specificData[inputKey as keyof typeof specificData];

  const input = MatrixSpecificDataFormInputs[inputKey];

  if (isNil(value)) {
    return null;
  }

  switch (input.inputType) {
    case 'checkbox':
      return value ? input.label : null;
    case 'select':
    case 'radio':
      return input.optionsLabels?.[value as string] || String(value);
    case 'text':
    case 'number':
    case 'textarea':
      return String(value);
    default:
      return String(value);
  }
};

export const MatrixSpecificDataFormInputs: Record<
  SampleMatrixSpecificDataKeys,
  SpecificDataFormInput
> = {
  matrixDetails: {
    inputType: 'text',
    label: 'Détail de la matrice',
    hintText: 'Champ facultatif pour précisions supplémentaires',
    whenValid: 'Détail de la matrice correctement renseigné.',
    testId: 'matrixdetails-input'
  },
  cultureKind: {
    inputType: 'select',
    label: 'Type de culture',
    whenValid: 'Type de culture correctement renseigné.',
    optionsLabels: CultureKindLabels,
    defaultOptionLabel: 'Sélectionner un type de culture',
    testId: 'culturekind-select'
  },
  matrixPart: {
    inputType: 'select',
    label: 'LMR / Partie du végétal concernée',
    whenValid: 'Partie du végétal correctement renseignée.',
    optionsLabels: MatrixPartLabels,
    defaultOptionLabel: 'Sélectionner une partie du végétal',
    testId: 'matrixpart-select'
  },
  releaseControl: {
    inputType: 'checkbox',
    label: 'Contrôle libératoire',
    whenValid: 'Contrôle libératoire correctement renseigné.'
  },
  species: {
    inputType: 'select',
    label: 'Espèce animale',
    whenValid: 'Expèce animale correctement renseignée.',
    optionsLabels: SpeciesLabels,
    defaultOptionLabel: 'Sélectionner une espèce',
    testId: 'species-select'
  },
  killingCode: {
    inputType: 'text',
    label: 'Code tuerie',
    whenValid: 'Code tuerie correctement renseigné.',
    testId: 'killing-code-input'
  },
  sampling: {
    inputType: 'select',
    label: 'Echantillonnage',
    whenValid: 'Echantillonnage correctement renseigné.'
  },
  animalKind: {
    inputType: 'select',
    label: "Type d'animal",
    whenValid: "Type d'animal correctement renseigné.",
    optionsLabels: AnimalKindLabels,
    defaultOptionLabel: "Sélectionner un type d'animal",
    testId: 'animal-kind-select'
  },
  productionKind: {
    inputType: 'select',
    label: 'Type de production',
    whenValid: 'Type de production correctement renseigné.',
    optionsLabels: ProductionKindLabels,
    defaultOptionLabel: 'Sélectionner un type de production',
    testId: 'production-kind-select'
  },
  animalIdentifier: {
    inputType: 'text',
    label: "Identifiant du lot ou de l'animal",
    whenValid: 'Identifiant correctement renseigné.',
    testId: 'animal-identifier-input'
  },
  breedingMethod: {
    inputType: 'select',
    label: "Mode d'élevage",
    whenValid: "Mode d'élevage correctement renseigné.",
    optionsLabels: BreedingMethodLabels,
    defaultOptionLabel: "Sélectionner un mode d'élevage",
    testId: 'breeding-method-select'
  },
  ageInDays: {
    inputType: 'number',
    label: 'Âge (en jours)',
    whenValid: 'Âge correctement renseigné.',
    testId: 'age-input'
  },
  ageInMonths: {
    inputType: 'number',
    label: 'Âge (en mois)',
    whenValid: 'Âge correctement renseigné.',
    testId: 'age-input'
  },
  sex: {
    inputType: 'select',
    label: 'Sexe',
    whenValid: 'Sexe correctement renseigné.',
    optionsLabels: AnimalSexLabels,
    defaultOptionLabel: 'Sélectionner un sexe',
    testId: 'sex-select'
  },
  seizure: {
    inputType: 'select',
    label: 'Saisie',
    whenValid: 'Saisie correctement renseignée.',
    optionsLabels: SeizureLabels,
    defaultOptionLabel: 'Sélectionner une saisie',
    testId: 'seizure-select'
  },
  outdoorAccess: {
    inputType: 'radio',
    label: "Accès à l'extérieur des animaux de l'élevage",
    whenValid: "Accès à l'extérieur correctement renseigné.",
    testId: 'outdoor-access-radio',
    optionsLabels: OutdoorAccessLabels,
    colSm: 4
  }
};
