import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { ZodObject } from 'zod';
import { UseForm } from '../../../hooks/useForm';
import { pluralize } from '../../../utils/stringUtils';
import AppSelect, { AppSelectProps } from '../AppSelect/AppSelect';
import { selectOptionsFromList } from '../AppSelect/AppSelectOption';

type Props<T extends ZodObject, U extends string> = Omit<
  AppSelectProps<T, UseForm<T>>,
  'onChange'
> & {
  onChange: (values: NoInfer<U>[]) => void;
  values: U[];
  keysWithLabels: Record<U, string>;
  defaultLabel: string;
};

export const AppMultiSelect = <T extends ZodObject, U extends string>({
  values,
  onChange,
  keysWithLabels,
  placeholder,
  defaultLabel,
  ...props
}: Props<T, U>) => {
  const options = selectOptionsFromList(
    Object.keys(keysWithLabels).filter((k) => !values.includes(k as U)),
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
        className={clsx('fr-mb-1w')}
        options={options}
        onChange={(e) => {
          const { success } = props.inputForm.schema
            .pick({ [props.inputKey]: true as const })
            .safeParse({ [props.inputKey]: [e.target.value] });

          if (success) {
            onChange([...values, e.target.value as U]);
          }
        }}
      />
      {values.length > 0 && (
        <div className={clsx()}>
          {values.map((value) => {
            const label = keysWithLabels[value] ?? '';
            return (
              <Tag
                key={value}
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
