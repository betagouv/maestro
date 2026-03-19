import { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  SachaFieldConfig,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';

export const storyFields: AdminFieldConfig[] = [
  {
    id: 'field-1' as SpecificDataFieldId,
    key: 'matrixDetails',
    inputType: 'text',
    label: 'Détail de la matrice',
    hintText: 'Champ facultatif pour précisions supplémentaires',
    options: []
  },
  {
    id: 'field-2' as SpecificDataFieldId,
    key: 'cultureKind',
    inputType: 'select',
    label: 'Type de culture',
    hintText: null,
    options: [
      {
        id: 'opt-1' as SpecificDataFieldOptionId,
        value: 'Z0211',
        label: 'Sous serre',
        order: 1
      },
      {
        id: 'opt-2' as SpecificDataFieldOptionId,
        value: 'PD06A',
        label: 'Production traditionnelle',
        order: 2
      }
    ]
  },
  {
    id: 'field-3' as SpecificDataFieldId,
    key: 'releaseControl',
    inputType: 'checkbox',
    label: 'Contrôle libératoire',
    hintText: null,
    options: []
  }
];

export const storySachaFields: SachaFieldConfig[] = [
  {
    key: 'cultureKind',
    inputType: 'select',
    label: 'Type de culture',
    hintText: null,
    sachaCommemoratifSigle: null,
    inDai: true,
    optional: false,
    options: [
      {
        value: 'Z0211',
        label: 'Sous serre',
        order: 1,
        sachaCommemoratifValueSigle: null
      },
      {
        value: 'PD06A',
        label: 'Production traditionnelle',
        order: 2,
        sachaCommemoratifValueSigle: null
      }
    ]
  }
];
