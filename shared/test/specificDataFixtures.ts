import { v4 as uuidv4 } from 'uuid';
import {
  type PlanKindFieldConfig,
  ProgrammingPlanKindFieldId
} from '../schema/SpecificData/PlanKindFieldConfig';

export const PPVFieldConfigs: PlanKindFieldConfig[] = [
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'PPV',
    required: false,
    order: 1,
    field: {
      key: 'matrixDetails',
      inputType: 'text',
      label: 'Détail de la matrice',
      hintText: 'Champ facultatif pour précisions supplémentaires',
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'PPV',
    required: false,
    order: 2,
    field: {
      key: 'cultureKind',
      inputType: 'select',
      label: 'Type de culture',
      hintText: null,
      options: [
        {
          value: 'Z0211',
          label: 'Sous serre/conditions de croissance protégées',
          order: 1
        },
        { value: 'PD06A', label: 'Production traditionnelle', order: 2 },
        {
          value: 'PD08A',
          label: 'Production industrielle intensive',
          order: 3
        },
        { value: 'Z0215', label: 'Méthode inconnue', order: 4 },
        { value: 'Z0153', label: 'Sauvages ou cueillis', order: 5 },
        { value: 'PD05A', label: 'Production en plein air', order: 6 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'PPV',
    required: true,
    order: 3,
    field: {
      key: 'productionKind',
      inputType: 'select',
      label: 'Type de production',
      hintText: null,
      options: [
        { value: 'PD07A', label: 'Production biologique', order: 1 },
        { value: 'PD09A', label: 'Production non biologique', order: 2 },
        { value: 'Z0216', label: 'Autre méthode de production', order: 3 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'PPV',
    required: true,
    order: 4,
    field: {
      key: 'matrixPart',
      inputType: 'select',
      label: 'LMR / Partie du végétal concernée',
      hintText: null,
      options: [
        {
          value: 'PART1',
          label: "Partie à laquelle s'applique la LMR",
          order: 1
        },
        {
          value: 'PART2',
          label: 'Partie non LMR (préciser en commentaire)',
          order: 2
        }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'PPV',
    required: false,
    order: 5,
    field: {
      key: 'releaseControl',
      inputType: 'checkbox',
      label: 'Contrôle libératoire',
      hintText: null,
      options: []
    }
  }
];

export const DAOAVolailleFieldConfigs: PlanKindFieldConfig[] = [
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 1,
    field: {
      key: 'sampling',
      inputType: 'select',
      label: 'Échantillonnage',
      hintText: null,
      options: [{ value: 'Aléatoire', label: 'Aléatoire', order: 1 }]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 2,
    field: {
      key: 'animalBatchIdentifier',
      inputType: 'text',
      label: 'Identifiant du lot',
      hintText: null,
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 3,
    field: {
      key: 'ageInDays',
      inputType: 'number',
      label: 'Âge (en jours)',
      hintText: null,
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 4,
    field: {
      key: 'species',
      inputType: 'select',
      label: 'Espèce animale',
      hintText: null,
      options: [
        { value: 'ESP7', label: 'Poulet de chair', order: 1 },
        { value: 'ESP8', label: 'Poule de réforme', order: 2 },
        { value: 'ESP10', label: 'Dinde', order: 3 },
        { value: 'ESP20', label: 'Autre volaille', order: 4 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 5,
    field: {
      key: 'breedingMethod',
      inputType: 'select',
      label: "Mode d'élevage",
      hintText: null,
      options: [
        { value: 'PROD_1', label: 'Biologique', order: 1 },
        { value: 'PROD_2', label: 'Standard', order: 2 },
        { value: 'PROD_3', label: 'Autre signe de qualité', order: 3 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_VOLAILLE',
    required: true,
    order: 6,
    field: {
      key: 'outdoorAccess',
      inputType: 'radio',
      label: "Accès à l'extérieur des animaux de l'élevage",
      hintText: null,
      options: [
        { value: 'PAT1', label: 'Oui', order: 1 },
        { value: 'PAT0', label: 'Non', order: 2 },
        { value: 'PATINCO', label: 'Inconnu', order: 3 }
      ]
    }
  }
];

export const DAOABovinFieldConfigs: PlanKindFieldConfig[] = [
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 1,
    field: {
      key: 'killingCode',
      inputType: 'text',
      label: 'Code tuerie',
      hintText: null,
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 2,
    field: {
      key: 'sampling',
      inputType: 'select',
      label: 'Échantillonnage',
      hintText: null,
      options: [{ value: 'Aléatoire', label: 'Aléatoire', order: 1 }]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 3,
    field: {
      key: 'animalUniqueIdentifier',
      inputType: 'text',
      label: "Identifiant de l'animal",
      hintText: null,
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 4,
    field: {
      key: 'animalKind',
      inputType: 'select',
      label: "Type d'animal",
      hintText: null,
      options: [
        { value: 'TYPEA1', label: 'Veau < 6 mois', order: 1 },
        {
          value: 'TYPEA2',
          label: 'Jeune bovin entre 6 et 24 mois',
          order: 2
        },
        {
          value: 'TYPEA3',
          label: 'Bovin > 24 mois hors vache de réforme',
          order: 3
        },
        { value: 'TYPEA4', label: 'Vache de réforme', order: 4 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 5,
    field: {
      key: 'sex',
      inputType: 'select',
      label: 'Sexe',
      hintText: null,
      options: [
        { value: 'SEX1', label: 'Mâle entier', order: 1 },
        { value: 'SEX2', label: 'Mâle castré', order: 2 },
        { value: 'SEX3', label: 'Mâle non déterminé', order: 3 },
        { value: 'SEX4', label: 'Femelle', order: 4 },
        { value: 'SEX5', label: 'Sexe inconnu', order: 5 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 6,
    field: {
      key: 'ageInMonths',
      inputType: 'number',
      label: 'Âge (en mois)',
      hintText: null,
      options: []
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 7,
    field: {
      key: 'productionKind',
      inputType: 'select',
      label: 'Type de production',
      hintText: null,
      options: [
        { value: 'PROD_1', label: 'Allaitant', order: 4 },
        { value: 'PROD_2', label: 'Laitier', order: 5 },
        { value: 'PROD_4', label: 'Boucherie', order: 6 },
        { value: 'PROD_3', label: 'Inconnu', order: 7 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 8,
    field: {
      key: 'outdoorAccess',
      inputType: 'radio',
      label: "Accès à l'extérieur des animaux de l'élevage",
      hintText: null,
      options: [
        { value: 'PAT1', label: 'Oui', order: 1 },
        { value: 'PAT0', label: 'Non', order: 2 },
        { value: 'PATINCO', label: 'Inconnu', order: 3 }
      ]
    }
  },
  {
    id: ProgrammingPlanKindFieldId.parse(uuidv4()),
    programmingPlanKind: 'DAOA_BOVIN',
    required: true,
    order: 9,
    field: {
      key: 'seizure',
      inputType: 'selectWithUnknown',
      label: 'Saisie',
      hintText: null,
      options: [
        { value: 'EMPTY', label: 'Absence', order: 1 },
        { value: 'PARTIAL', label: 'Partielle', order: 2 },
        { value: 'TOTAL', label: 'Totale', order: 3 }
      ]
    }
  }
];

export const AllFieldConfigs = [
  ...PPVFieldConfigs,
  ...DAOAVolailleFieldConfigs,
  ...DAOABovinFieldConfigs
];

export const SachaFieldConfigs = [
  ...DAOAVolailleFieldConfigs,
  ...DAOABovinFieldConfigs
];
