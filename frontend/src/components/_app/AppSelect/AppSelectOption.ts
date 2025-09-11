import { User } from 'maestro-shared/schema/User/User';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';

export interface AppSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

export interface AppSelectOptionsGroup {
  label?: string;
  options: AppSelectOption[];
}

export const defaultAppSelectOption = (
  optionLabel?: string
): AppSelectOption => ({
  label: `${optionLabel ?? 'Sélectionner une valeur'}`,
  value: ''
});

const DefaultSelectOptionsFromListConfig = {
  withDefault: true
};

export const selectOptionsFromList = (
  list: string[],
  config: {
    labels?: Record<string, string>;
    withDefault?: boolean;
    withSort?: boolean;
    defaultLabel?: string;
  } = {
    withDefault: true,
    withSort: true
  }
): AppSelectOption[] => {
  const selectConfig = {
    ...DefaultSelectOptionsFromListConfig,
    ...config
  };
  return [
    ...(selectConfig.withDefault
      ? [defaultAppSelectOption(selectConfig.defaultLabel)]
      : []),
    ...list
      .map((item) => ({
        label: selectConfig.labels ? selectConfig.labels[item] : item,
        value: item
      }))
      .filter((item) => isDefinedAndNotNull(item.label) && item.label !== '')
      .sort((a, b) => (config.withSort ? a.label.localeCompare(b.label) : 0))
  ];
};

export const samplersOptions = (
  samplers?: User[],
  currentUserId?: string
): AppSelectOption[] =>
  (samplers ?? [])
    .filter(({ name }) => name !== '-')
    .sort((a, b) => {
      if (a.id === currentUserId) {
        return -1;
      }
      if (b.id === currentUserId) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    })
    .map((sampler) => ({
      label: sampler.name,
      value: sampler.id
    }));
