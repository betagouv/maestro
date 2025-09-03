import {
  AnimalKindLabels,
  AnimalKindsByProgrammingPlanKind
} from 'maestro-shared/referential/AnimalKind';
import {
  AnimalSexLabels,
  AnimalSexList
} from 'maestro-shared/referential/AnimalSex';
import {
  BreedingMethodLabels,
  BreedingMethodList
} from 'maestro-shared/referential/BreedingMethod';
import {
  CultureKindLabels,
  CultureKindList
} from 'maestro-shared/referential/CultureKind';
import {
  MatrixPartLabels,
  MatrixPartList
} from 'maestro-shared/referential/Matrix/MatrixPart';
import {
  OutdoorAccessLabels,
  OutdoorAccessList
} from 'maestro-shared/referential/OutdoorAccess';
import {
  ProductionKindLabels,
  ProductionKindsByProgrammingPlanKind
} from 'maestro-shared/referential/ProductionKind';
import {
  ProductionMethodLabels,
  ProductionMethodList
} from 'maestro-shared/referential/ProductionMethod';
import { SeizureLabels, SeizureList } from 'maestro-shared/referential/Seizure';
import {
  SpeciesByProgrammingPlanKind,
  SpeciesLabels
} from 'maestro-shared/referential/Species';
import {
  TargetingCriteriaLabels,
  TargetingCriteriaList
} from 'maestro-shared/referential/TargetingCriteria';
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
  targetingCriteria: {
    inputType: 'select',
    label: 'Critère de ciblage',
    whenValid: 'Critère de ciblage correctement renseigné.',
    optionsValues: TargetingCriteriaList,
    optionsLabels: TargetingCriteriaLabels,
    defaultOptionLabel: 'Sélectionner un critère de ciblage',
    testId: 'targeting-criteria-select'
  },
  notesOnTargetingCriteria: {
    inputType: 'textarea',
    label: 'Précisions critère de ciblage',
    whenValid: 'Précisions correctement renseignées.',
    rows: 1,
    testId: 'notes-on-targeting-criteria-input'
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
  breedingMethod: {
    inputType: 'select',
    label: "Mode d'élevage",
    whenValid: "Mode d'élevage correctement renseigné.",
    optionsValues: BreedingMethodList,
    optionsLabels: BreedingMethodLabels,
    defaultOptionLabel: 'Sélectionner un mode d’élevage',
    testId: 'breeding-method-select'
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
  },
  seizure: {
    inputType: 'select',
    label: 'Saisie',
    whenValid: 'Saisie correctement renseignée.',
    optionsValues: SeizureList,
    optionsLabels: SeizureLabels,
    defaultOptionLabel: 'Sélectionner une saisie',
    testId: 'seizure-select'
  },
  outdoorAccess: {
    inputType: 'radio',
    label: "Accès à l'extérieur des animaux de l'élevage",
    whenValid: "Accès à l'extérieur correctement renseigné.",
    testId: 'outdoor-access-radio',
    optionsValues: OutdoorAccessList,
    optionsLabels: OutdoorAccessLabels,
    colSm: 4
  }
};
