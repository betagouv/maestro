import { format } from 'date-fns';
import { SampleBase, SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import React, { useContext, useState } from 'react';
import z from 'zod';
import { useForm } from '../../../../hooks/useForm';

import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import check from '../../../../assets/illustrations/check.svg';
import warning from '../../../../assets/illustrations/warning.svg';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { ApiClientContext } from '../../../../services/apiClient';

const FormChecked = SampleBase.pick({
  receivedAt: true,
  notesOnAdmissibility: true
})
  .merge(
    z.object({
      isReceived: z.boolean({
        message:
          'Veuillez renseigner la notification de réception par le laboratoire.'
      }),
      isAdmissible: z.boolean().nullish()
    })
  )
  .check((ctx) => {
    const val = ctx.value;
    if (val.isReceived && !val.receivedAt) {
      ctx.issues.push({
        code: 'custom',
        input: val,
        message: 'Veuillez renseigner la date de réception.',
        path: ['receivedAt']
      });
    }
    if (val.isReceived && val.isAdmissible === undefined) {
      ctx.issues.push({
        code: 'custom',
        input: val,
        path: ['isAdmissible'],
        message: 'Veuillez renseigner la recevabilité du prélèvement.'
      });
    }
  });

export type FormRefinement = ReturnType<typeof useForm<typeof FormChecked>>;
type Props = {
  sample: SampleChecked;
  withSubmitButton: boolean;
  setForm?: (form: FormRefinement) => void;
};
export const SampleItemAdmissibilityForm: FunctionComponent<Props> = ({
  sample,
  withSubmitButton,
  setForm,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateSample] = apiClient.useUpdateSampleMutation();

  const [isReceived, setIsReceived] = useState(
    ['Analysis', 'NotAdmissible', 'Completed'].includes(sample.status)
      ? sample.receivedAt !== undefined
      : null
  );
  const [receivedAt, setReceivedAt] = useState(
    sample.receivedAt ? format(sample.receivedAt, 'yyyy-MM-dd') : null
  );
  const [isAdmissible, setIsAdmissible] = useState(
    ['Analysis', 'Completed'].includes(sample.status)
      ? true
      : sample.status === 'NotAdmissible'
        ? false
        : null
  );
  const [notesOnAdmissibility, setNotesOnAdmissibility] = useState(
    sample.notesOnAdmissibility
  );

  const form = useForm(FormChecked, {
    isReceived,
    receivedAt,
    isAdmissible,
    notesOnAdmissibility
  });
  setForm?.(form);

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();

    await form.validate(
      async ({ receivedAt, isAdmissible, notesOnAdmissibility }) => {
        await updateSample({
          ...sample,
          receivedAt,
          status: isAdmissible === false ? 'NotAdmissible' : 'Analysis',
          notesOnAdmissibility: notesOnAdmissibility
        });
        form.reset();
      }
    );
  };

  return (
    <form
      className={clsx(
        'border',
        cx(
          'fr-callout',
          ['Analysis', 'Completed'].includes(sample.status)
            ? 'fr-callout--green-emeraude'
            : 'fr-callout--pink-tuile'
        ),
        'sample-callout'
      )}
    >
      <h4 className={cx('fr-mb-0')}>Recevabilité par le laboratoire</h4>
      <AppRadioButtons
        legend="Notification de réception par le laboratoire"
        options={[
          {
            label: 'Notification reçue',
            nativeInputProps: {
              checked: isReceived === true,
              onChange: () => {
                setIsReceived(true);
                setReceivedAt(format(new Date(), 'yyyy-MM-dd'));
              }
            }
          },
          {
            label: 'Notification non reçue',
            nativeInputProps: {
              checked: isReceived === false,
              onChange: () => {
                setIsReceived(false);
                setReceivedAt(null);
                setIsAdmissible(null);
                setNotesOnAdmissibility(null);
              }
            }
          }
        ]}
        colSm={6}
        inputForm={form}
        inputKey="isReceived"
        whenValid="Notification de réception correctement renseignée."
        required
      />
      {isReceived && (
        <>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              <AppTextInput
                type="date"
                defaultValue={receivedAt ?? ''}
                onChange={(e) => setReceivedAt(e.target.value)}
                inputForm={form}
                inputKey="receivedAt"
                whenValid="Date de réception correctement renseignée."
                label="Date de réception"
                hintText="Format attendu › JJ/MM/AAAA"
                required
              />
            </div>
          </div>
          <AppRadioButtons
            legend="Échantillon"
            options={[
              {
                label: 'Recevable',
                nativeInputProps: {
                  checked: isAdmissible === true,
                  onChange: () => {
                    setIsAdmissible(true);
                    setNotesOnAdmissibility(null);
                  }
                },
                illustration: <img src={check} alt="" aria-hidden />
              },
              {
                label: 'Non recevable',
                nativeInputProps: {
                  checked: isAdmissible === false,
                  onChange: () => {
                    setIsAdmissible(false);
                    setNotesOnAdmissibility(null);
                  }
                },
                illustration: <img src={warning} alt="" aria-hidden />
              }
            ]}
            colSm={6}
            inputForm={form}
            inputKey="isAdmissible"
            whenValid="Recevabilité correctement renseignée."
            required
          />
          {isAdmissible === false && (
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              <div className={cx('fr-col-12')}>
                <AppTextAreaInput
                  defaultValue={notesOnAdmissibility ?? ''}
                  onChange={(e) => setNotesOnAdmissibility(e.target.value)}
                  inputForm={form}
                  inputKey="notesOnAdmissibility"
                  whenValid="Motif de non-recevabilité correctement renseigné."
                  label="Motif de non-recevabilité"
                  hintText="Champ facultatif pour précisions supplémentaires"
                />
              </div>
            </div>
          )}
        </>
      )}

      {withSubmitButton && (
        <Button type={'submit'} priority={'primary'} onClick={save}>
          Enregistrer
        </Button>
      )}
    </form>
  );
};
