import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { ZodObject } from 'zod';
import { UseForm } from '../../../hooks/useForm';
import { pluralize } from '../../../utils/stringUtils';
import AppSelect, { AppSelectProps } from '../AppSelect/AppSelect';
import { selectOptionsFromList } from '../AppSelect/AppSelectOption';

type Props<T extends ZodObject, U> = Omit<
  AppSelectProps<T, UseForm<T>>,
  'onChange'
> & {
  onChange: (values: NoInfer<U>[]) => void;
  values: U[];
  items: U[];
  keysWithLabels: Record<string, string>;
  defaultLabel: string;
  idKey?: keyof NoInfer<U>;
};

export const AppMultiSelect = <T extends ZodObject, U>({
  values,
  onChange,
  items,
  keysWithLabels,
  placeholder,
  defaultLabel,
  idKey,
  ...props
}: Props<T, U>) => {
  const keysSelected = values.map((v) => (idKey ? v[idKey] : v));
  const options = selectOptionsFromList(
    items
      .filter((k) => !keysSelected.includes(idKey ? k[idKey] : k))
      .map((i) => (idKey ? i[idKey] : i)) as string[],
    {
      labels: keysWithLabels,
      withSort: true,
      defaultLabel: values.length
        ? pluralize(values.length, { preserveCount: true })(defaultLabel)
        : undefined
    }
  );
  return (
    <div>
      <AppSelect
        {...props}
        className={clsx(values.length > 0 ? 'fr-mb-1w' : 'fr-mb-3w')}
        options={options}
        onChange={(e) => {
          const selectedItem = items.find(
            (i) => (idKey ? i[idKey] : i) === e.target.value
          );

          if (selectedItem) {
            onChange([...values, selectedItem]);
          }
        }}
      />
      {values.length > 0 && (
        <div className={clsx('fr-mb-3w')}>
          {values.map((value) => {
            const label =
              keysWithLabels[(idKey ? value[idKey] : value) as string] ?? '';
            return (
              <Tag
                key={(idKey ? value[idKey] : value) as string}
                small={true}
                dismissible={true}
                nativeButtonProps={{
                  onClick: () => onChange?.(values.filter((v) => v !== value))
                }}
              >
                {label}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
};
