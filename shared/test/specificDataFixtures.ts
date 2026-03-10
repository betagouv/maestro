import { PlanKindFieldConfig } from '../schema/SpecificData/PlanKindFieldConfig';

export const PPVFieldConfigs: PlanKindFieldConfig[] = [
  {
    programmingPlanKind: 'PPV',
    required: false,
    order: 1,
    field: {
      key: 'matrixDetails',
      inputType: 'text',
      label: 'Détail de la matrice',
      whenValid: 'Détail de la matrice correctement renseigné.',
      hintText: 'Champ facultatif pour précisions supplémentaires',
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'PPV',
    required: false,
    order: 2,
    field: {
      key: 'cultureKind',
      inputType: 'select',
      label: 'Type de culture',
      whenValid: 'Type de culture correctement renseigné.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner un type de culture',
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
    programmingPlanKind: 'PPV',
    required: true,
    order: 3,
    field: {
      key: 'productionKind',
      inputType: 'select',
      label: 'Type de production',
      whenValid: 'Type de production correctement renseigné.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner un type de production',
      options: [
        { value: 'PD07A', label: 'Production biologique', order: 1 },
        { value: 'PD09A', label: 'Production non biologique', order: 2 },
        { value: 'Z0216', label: 'Autre méthode de production', order: 3 }
      ]
    }
  },
  {
    programmingPlanKind: 'PPV',
    required: true,
    order: 4,
    field: {
      key: 'matrixPart',
      inputType: 'select',
      label: 'LMR / Partie du végétal concernée',
      whenValid: 'Partie du végétal correctement renseignée.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner une partie du végétal',
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
    programmingPlanKind: 'PPV',
    required: false,
    order: 5,
    field: {
      key: 'releaseControl',
      inputType: 'checkbox',
      label: 'Contrôle libératoire',
      whenValid: 'Contrôle libératoire correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  }
];

export const DAOABreedingFieldConfigs: PlanKindFieldConfig[] = [
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 1,
    field: {
      key: 'sampling',
      inputType: 'select',
      label: 'Échantillonnage',
      whenValid: 'Échantillonnage correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 2,
    field: {
      key: 'animalIdentifier',
      inputType: 'text',
      label: "Identifiant du lot ou de l'animal",
      whenValid: 'Identifiant correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 3,
    field: {
      key: 'ageInDays',
      inputType: 'number',
      label: 'Âge (en jours)',
      whenValid: 'Âge correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 4,
    field: {
      key: 'species',
      inputType: 'select',
      label: 'Espèce animale',
      whenValid: 'Expèce animale correctement renseignée.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner une espèce',
      options: [
        { value: 'ESP7', label: 'Poulet de chair', order: 1 },
        { value: 'ESP8', label: 'Poule de réforme', order: 2 },
        { value: 'ESP10', label: 'Dinde', order: 3 },
        { value: 'ESP20', label: 'Autre volaille', order: 4 }
      ]
    }
  },
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 5,
    field: {
      key: 'breedingMethod',
      inputType: 'select',
      label: "Mode d'élevage",
      whenValid: "Mode d'élevage correctement renseigné.",
      hintText: null,
      defaultOptionLabel: "Sélectionner un mode d'élevage",
      options: [
        { value: 'PROD_1', label: 'Biologique', order: 1 },
        { value: 'PROD_2', label: 'Standard', order: 2 },
        { value: 'PROD_3', label: 'Autre signe de qualité', order: 3 }
      ]
    }
  },
  {
    programmingPlanKind: 'DAOA_BREEDING',
    required: true,
    order: 6,
    field: {
      key: 'outdoorAccess',
      inputType: 'radio',
      label: "Accès à l'extérieur des animaux de l'élevage",
      whenValid: "Accès à l'extérieur correctement renseigné.",
      hintText: null,
      defaultOptionLabel: null,
      options: [
        { value: 'PAT1', label: 'Oui', order: 1 },
        { value: 'PAT0', label: 'Non', order: 2 },
        { value: 'PATINCO', label: 'Inconnu', order: 3 }
      ]
    }
  }
];

export const DAOASlaughterFieldConfigs: PlanKindFieldConfig[] = [
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 1,
    field: {
      key: 'killingCode',
      inputType: 'text',
      label: 'Code tuerie',
      whenValid: 'Code tuerie correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 2,
    field: {
      key: 'sampling',
      inputType: 'select',
      label: 'Échantillonnage',
      whenValid: 'Échantillonnage correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 3,
    field: {
      key: 'animalIdentifier',
      inputType: 'text',
      label: "Identifiant du lot ou de l'animal",
      whenValid: 'Identifiant correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 4,
    field: {
      key: 'animalKind',
      inputType: 'select',
      label: "Type d'animal",
      whenValid: "Type d'animal correctement renseigné.",
      hintText: null,
      defaultOptionLabel: "Sélectionner un type d'animal",
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
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 5,
    field: {
      key: 'sex',
      inputType: 'select',
      label: 'Sexe',
      whenValid: 'Sexe correctement renseigné.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner un sexe',
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
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 6,
    field: {
      key: 'ageInMonths',
      inputType: 'number',
      label: 'Âge (en mois)',
      whenValid: 'Âge correctement renseigné.',
      hintText: null,
      defaultOptionLabel: null,
      options: []
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 7,
    field: {
      key: 'productionKind',
      inputType: 'select',
      label: 'Type de production',
      whenValid: 'Type de production correctement renseigné.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner un type de production',
      options: [
        { value: 'PROD_1', label: 'Allaitant', order: 4 },
        { value: 'PROD_2', label: 'Laitier', order: 5 },
        { value: 'PROD_4', label: 'Boucherie', order: 6 },
        { value: 'PROD_3', label: 'Inconnu', order: 7 }
      ]
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 8,
    field: {
      key: 'outdoorAccess',
      inputType: 'radio',
      label: "Accès à l'extérieur des animaux de l'élevage",
      whenValid: "Accès à l'extérieur correctement renseigné.",
      hintText: null,
      defaultOptionLabel: null,
      options: [
        { value: 'PAT1', label: 'Oui', order: 1 },
        { value: 'PAT0', label: 'Non', order: 2 },
        { value: 'PATINCO', label: 'Inconnu', order: 3 }
      ]
    }
  },
  {
    programmingPlanKind: 'DAOA_SLAUGHTER',
    required: true,
    order: 9,
    field: {
      key: 'seizure',
      inputType: 'selectWithUnknown',
      label: 'Saisie',
      whenValid: 'Saisie correctement renseignée.',
      hintText: null,
      defaultOptionLabel: 'Sélectionner une saisie',
      options: [
        { value: 'EMPTY', label: 'Absence', order: 1 },
        { value: 'PARTIAL', label: 'Partielle', order: 2 },
        { value: 'TOTAL', label: 'Totale', order: 3 }
      ]
    }
  }
];
