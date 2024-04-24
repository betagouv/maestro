import { Laboratory } from 'shared/schema/Laboratory/Laboratory';

export interface AppSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

export const DefaultAppSelectOption: AppSelectOption = {
  label: 'Sélectionner une valeur',
  value: '',
  disabled: true,
};

export const selectOptionsFromList = (
  list: string[],
  labels?: Record<string, string>
): AppSelectOption[] => {
  return [
    DefaultAppSelectOption,
    ...list.map((item) => ({
      label: labels?.[item] ?? item,
      value: item,
    })),
  ];
};

export const laboratoriesOptions = (
  laboratories: Laboratory[] = []
): AppSelectOption[] => {
  return [
    {
      ...DefaultAppSelectOption,
      label: '-',
    },
    ...laboratories.map((laboratory) => ({
      label: laboratory.name,
      value: laboratory.id,
    })),
  ];
};
