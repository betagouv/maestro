import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { useId } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import type { UseForm } from 'src/hooks/useForm';
import type { ZodObject, z } from 'zod';

type Props<T extends ZodObject, U extends UseForm<T>> = {
  label: string;
  hintText?: string;
  values: string[];
  onChange: (values: string[]) => void;
  inputForm: U;
  inputKey: keyof NoInfer<z.infer<U['schema']>>;
  inputPathFromKey?: (string | number)[];
  required?: boolean;
  placeholder?: string;
  addLabel?: string;
  whenValid?: string;
};

function AppMultipleInput<T extends ZodObject>({
  label,
  hintText,
  values,
  onChange,
  inputForm,
  inputKey,
  inputPathFromKey = [],
  required,
  placeholder,
  addLabel = 'Ajouter une valeur',
  whenValid
}: Props<T, UseForm<T>>) {
  const fieldsetId = useId();

  const updateValue = (index: number, newValue: string) => {
    const next = [...values];
    next[index] = newValue;
    onChange(next);
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const addValue = () => {
    onChange([...values, '']);
  };

  const displayValues = values.length === 0 ? [''] : values;
  const canRemove = displayValues.length > 1;

  const globalMessageType = inputForm.messageType(inputKey, inputPathFromKey);
  const globalMessage = inputForm.message(
    inputKey,
    inputPathFromKey,
    whenValid
  );
  const showGlobalError = globalMessageType === 'error' && values.length === 0;

  return (
    <fieldset
      className={cx('fr-fieldset')}
      style={{ width: '100%' }}
      aria-labelledby={`${fieldsetId}-legend`}
    >
      <legend
        id={`${fieldsetId}-legend`}
        className={cx('fr-fieldset__legend', 'fr-text--regular')}
      >
        {label}
        {required && <AppRequiredInput />}
        {hintText && <span className={cx('fr-hint-text')}>{hintText}</span>}
      </legend>

      <div className={cx('fr-fieldset__element')} style={{ width: '100%' }}>
        {displayValues.map((value, index) => {
          const itemPath = [...inputPathFromKey, index];
          const itemMessageType = inputForm.messageType(inputKey, itemPath);
          const itemMessage = inputForm.message(inputKey, itemPath, whenValid);
          const itemState =
            required || itemMessageType === 'error'
              ? itemMessageType
              : 'default';
          const itemLabel = `${label} — valeur ${index + 1}`;

          return (
            <Input
              key={`item-${index}`}
              label={itemLabel}
              hideLabel
              nativeInputProps={{
                value,
                placeholder,
                required,
                onChange: (e) => updateValue(index, e.target.value)
              }}
              state={itemState}
              stateRelatedMessage={itemMessage}
              addon={
                canRemove ? (
                  <Button
                    type="button"
                    priority="tertiary no outline"
                    iconId="fr-icon-delete-bin-line"
                    title={`Supprimer la valeur ${index + 1}`}
                    onClick={() => removeValue(index)}
                  />
                ) : undefined
              }
            />
          );
        })}

        {showGlobalError && globalMessage && (
          <p className={cx('fr-error-text')}>{globalMessage}</p>
        )}

        <Button
          type="button"
          priority="secondary"
          iconId="fr-icon-add-line"
          iconPosition="left"
          onClick={addValue}
        >
          {addLabel}
        </Button>
      </div>
    </fieldset>
  );
}

export default AppMultipleInput;
