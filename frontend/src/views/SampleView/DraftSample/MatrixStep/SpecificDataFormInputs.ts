import { AnimalKindLabels } from 'maestro-shared/referential/AnimalKind';
import { AnimalSexLabels } from 'maestro-shared/referential/AnimalSex';
import { BreedingMethodLabels } from 'maestro-shared/referential/BreedingMethod';
import { CultureKindLabels } from 'maestro-shared/referential/CultureKind';
import { MatrixPartLabels } from 'maestro-shared/referential/Matrix/MatrixPart';
import { OutdoorAccessLabels } from 'maestro-shared/referential/OutdoorAccess';
import { ProductionKindLabels } from 'maestro-shared/referential/ProductionKind';
import { SeizureLabels } from 'maestro-shared/referential/Seizure';
import { SpeciesLabels } from 'maestro-shared/referential/Species';
import { TargetingCriteriaLabels } from 'maestro-shared/referential/TargetingCriteria';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/Sample';

type UnionKeys<T> = T extends any ? keyof T : never;
export type SampleMatrixSpecificDataKeys = UnionKeys<SampleMatrixSpecificData>;

export type SpecificDataFormInput = {
  label: string;
  whenValid: string;
  testId?: string;
} & (
  | { inputType: 'text' | 'textarea' | 'number'; hintText?: string }
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

//TODO enlever le partial
export const SpecificDataFormInputs: Partial<
  Record<SampleMatrixSpecificDataKeys, SpecificDataFormInput>
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
  targetingCriteria: {
    inputType: 'select',
    label: 'Critère de ciblage',
    whenValid: 'Critère de ciblage correctement renseigné.',
    optionsLabels: TargetingCriteriaLabels,
    defaultOptionLabel: 'Sélectionner un critère de ciblage',
    testId: 'targeting-criteria-select'
  },
  notesOnTargetingCriteria: {
    inputType: 'textarea',
    label: 'Précisions critère de ciblage',
    whenValid: 'Précisions correctement renseignées.',
    testId: 'notes-on-targeting-criteria-input'
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
    defaultOptionLabel: 'Sélectionner un mode d’élevage',
    testId: 'breeding-method-select'
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
