import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type {
  SachaFieldConfig,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';

export const storyFields: AdminFieldConfig[] = [
  {
    id: 'field-1' as SpecificDataFieldId,
    key: 'matrixDetails',
    inputType: 'text',
    label: 'Détail de la matrice',
    hintText: 'Champ facultatif pour précisions supplémentaires',
    sachaCommemoratifSigle: null,
    sachaInDai: false,
    sachaOptional: false,
    options: []
  },
  {
    id: 'field-2' as SpecificDataFieldId,
    key: 'cultureKind',
    inputType: 'select',
    label: 'Type de culture',
    hintText: null,
    sachaCommemoratifSigle: null,
    sachaInDai: true,
    sachaOptional: false,
    options: [
      {
        id: 'opt-1' as SpecificDataFieldOptionId,
        value: 'Z0211',
        label: 'Sous serre',
        order: 1,
        sachaCommemoratifValueSigle: null
      },
      {
        id: 'opt-2' as SpecificDataFieldOptionId,
        value: 'PD06A',
        label: 'Production traditionnelle',
        order: 2,
        sachaCommemoratifValueSigle: null
      }
    ]
  },
  {
    id: 'field-3' as SpecificDataFieldId,
    key: 'releaseControl',
    inputType: 'checkbox',
    label: 'Contrôle libératoire',
    hintText: null,
    sachaCommemoratifSigle: null,
    sachaInDai: false,
    sachaOptional: false,
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
