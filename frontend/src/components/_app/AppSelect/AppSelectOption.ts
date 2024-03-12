export interface AppSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

export const selectOptionsFromList = (
  list: string[],
  labels?: Record<string, string>
): AppSelectOption[] => {
  return [
    {
      label: 'Sélectionner une valeur',
      value: '',
      disabled: true,
    },
    ...list.map((item) => ({
      label: labels?.[item] ?? item,
      value: item,
    })),
  ];
};
