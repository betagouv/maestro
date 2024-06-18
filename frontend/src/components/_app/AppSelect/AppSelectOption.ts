import { Laboratory } from 'shared/schema/Laboratory/Laboratory';
import { isDefinedAndNotNull } from 'shared/utils/utils';

export interface AppSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

export const defaultAppSelectOption = (
  optionLabel?: string
): AppSelectOption => ({
  label: `${optionLabel ?? 'Sélectionner une valeur'}`,
  value: '',
  disabled: true,
});

const DefaultSelectOptionsFromListConfig = {
  withDefault: true,
};

export const selectOptionsFromList = (
  list: string[],
  config: {
    labels?: Record<string, string>;
    withDefault?: boolean;
    defaultLabel?: string;
  } = {
    withDefault: true,
  }
): AppSelectOption[] => {
  const selectConfig = {
    ...DefaultSelectOptionsFromListConfig,
    ...config,
  };
  return [
    ...(selectConfig.withDefault
      ? [defaultAppSelectOption(selectConfig.defaultLabel)]
      : []),
    ...list
      .map((item) => ({
        label: selectConfig.labels ? selectConfig.labels[item] : item,
        value: item,
      }))
      .filter((item) => isDefinedAndNotNull(item.label) && item.label !== '')
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
};

export const laboratoriesOptions = (
  laboratories: Laboratory[] = []
): AppSelectOption[] => {
  return [
    {
      ...defaultAppSelectOption('Sélectionner un laboratoire'),
      label: '-',
    },
    ...laboratories.map((laboratory) => ({
      label: laboratory.name,
      value: laboratory.id,
    })),
  ];
};
