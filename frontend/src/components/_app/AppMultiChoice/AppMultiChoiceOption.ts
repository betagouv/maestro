export type AppMultiChoiceOption<T extends string> = {
  value: T;
  label: string;
};

export const orderedValues = <T extends string>(
  options: AppMultiChoiceOption<T>[],
  values: T[]
): T[] =>
  options
    .map((option) => option.value)
    .filter((value) => values.includes(value));
