import {
  AnimalKindLabels,
  AnimalKindsByProgrammingPlanKind
} from 'maestro-shared/referential/AnimalKind';
import {
  AnimalSexLabels,
  AnimalSexList
} from 'maestro-shared/referential/AnimalSex';

import {
  CultureKindLabels,
  CultureKindList
} from 'maestro-shared/referential/CultureKind';
import {
  MatrixPartLabels,
  MatrixPartList
} from 'maestro-shared/referential/Matrix/MatrixPart';

import {
  ProductionKindLabels,
  ProductionKindsByProgrammingPlanKind
} from 'maestro-shared/referential/ProductionKind';
import {
  ProductionMethodLabels,
  ProductionMethodList
} from 'maestro-shared/referential/ProductionMethod';
import {
  SpeciesByProgrammingPlanKind,
  SpeciesLabels
} from 'maestro-shared/referential/Species';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

type UnionKeys<T, O extends string> = T extends any ? keyof Omit<T, O> : never;
export type SampleMatrixSpecificDataKeys = UnionKeys<
  SampleMatrixSpecificData,
  'programmingPlanKind'
>;

type SpecificDataFormInput = {
  label: string;
  whenValid: string;
  testId?: string;
} & (
  | { inputType: 'text' | 'number'; hintText?: string }
  | { inputType: 'textarea'; hintText?: string; rows?: number }
  | {
      inputType: 'select';
      optionsValues: string[] | Partial<Record<ProgrammingPlanKind, string[]>>;
      optionsLabels?: Record<string, string>;
      defaultOptionLabel?: string;
    }
  | { inputType: 'checkbox' }
  | {
      inputType: 'radio';
      optionsValues: string[] | Partial<Record<ProgrammingPlanKind, string[]>>;
      optionsLabels: Record<string, string>;
      colSm: 2 | 3 | 4 | 6 | 12;
    }
);

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
    optionsValues: CultureKindList,
    optionsLabels: CultureKindLabels,
    defaultOptionLabel: 'Sélectionner un type de culture',
    testId: 'culturekind-select'
  },
  matrixPart: {
    inputType: 'select',
    label: 'LMR / Partie du végétal concernée',
    whenValid: 'Partie du végétal correctement renseignée.',
    optionsValues: MatrixPartList,
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
    optionsValues: SpeciesByProgrammingPlanKind,
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
  animalKind: {
    inputType: 'select',
    label: "Type d'animal",
    whenValid: "Type d'animal correctement renseigné.",
    optionsValues: AnimalKindsByProgrammingPlanKind,
    optionsLabels: AnimalKindLabels,
    defaultOptionLabel: "Sélectionner un type d'animal",
    testId: 'animal-kind-select'
  },
  productionKind: {
    inputType: 'select',
    label: 'Type de production',
    whenValid: 'Type de production correctement renseigné.',
    optionsValues: ProductionKindsByProgrammingPlanKind,
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
  productionMethod: {
    inputType: 'select',
    label: 'Mode de production',
    whenValid: 'Mode de production correctement renseigné.',
    optionsValues: ProductionMethodList,
    optionsLabels: ProductionMethodLabels,
    defaultOptionLabel: 'Sélectionner un mode de production',
    testId: 'production-method-select'
  },
  age: {
    inputType: 'number',
    label: 'Âge (en mois)',
    whenValid: 'Âge correctement renseigné.',
    testId: 'age-input'
  },
  sex: {
    inputType: 'select',
    label: 'Sexe',
    whenValid: 'Sexe correctement renseigné.',
    optionsValues: AnimalSexList,
    optionsLabels: AnimalSexLabels,
    defaultOptionLabel: 'Sélectionner un sexe',
    testId: 'sex-select'
  }
};
