import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { ComponentPropsWithoutRef } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { UseForm } from 'src/hooks/useForm';
import { z, ZodObject } from 'zod/v4';
import './AppRadioButtons.scss';

type AppRadioButtonsProps<T extends ZodObject, U extends UseForm<T>> = Pick<
  ComponentPropsWithoutRef<typeof RadioButtons>,
  'legend' | 'options' | 'state' | 'stateRelatedMessage' | 'disabled'
> & {
  inputForm: U;
  inputKey: keyof NoInfer<z.infer<U['schema']>>;
  inputPathFromKey?: (string | number)[];
  whenValid?: string;
  required?: boolean;
  colSm?: 2 | 3 | 4 | 6 | 12;
};

function AppRadioButtons<T extends ZodObject>(
  props: AppRadioButtonsProps<T, UseForm<T>>
) {
  const {
    inputKey,
    inputPathFromKey,
    inputForm,
    whenValid,
    state,
    stateRelatedMessage,
    colSm,
    ...radioButtonsProps
  } = props;

  const isRichRadio =
    radioButtonsProps.options.find(
      (options) => options.illustration !== undefined
    ) !== undefined;

  return (
    <RadioButtons
      {...radioButtonsProps}
      legend={
        radioButtonsProps.legend && (
          <>
            {radioButtonsProps.legend}
            {radioButtonsProps.required && <AppRequiredInput />}
          </>
        )
      }
      state={state ?? inputForm.messageType(inputKey, inputPathFromKey)}
      stateRelatedMessage={
        stateRelatedMessage ??
        inputForm.message(inputKey, inputPathFromKey, whenValid)
      }
      classes={{
        inputGroup: cx('fr-col-12', {
          'fr-col-sm-6': colSm === 6,
          'fr-col-sm-4': colSm === 4,
          'fr-py-0': !isRichRadio
        }),
        content: cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mx-0'),
        root: cx('fr-px-0', 'fr-my-0'),
        legend: cx('fr-col-12', 'fr-mx-0')
      }}
    />
  );
}

export default AppRadioButtons;
