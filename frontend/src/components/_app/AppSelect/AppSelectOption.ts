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

const DefaultSelectOptionsFromListConfig = {
  withDefault: true,
};

export const selectOptionsFromList = (
  list: string[],
  config: {
    labels?: Record<string, string>;
    withDefault?: boolean;
  } = {
    withDefault: true,
  }
): AppSelectOption[] => {
  const selectConfig = {
    ...DefaultSelectOptionsFromListConfig,
    ...config,
  };
  return [
    ...(selectConfig.withDefault ? [DefaultAppSelectOption] : []),
    ...list.map((item) => ({
      label: selectConfig.labels ? selectConfig.labels[item] : item,
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
