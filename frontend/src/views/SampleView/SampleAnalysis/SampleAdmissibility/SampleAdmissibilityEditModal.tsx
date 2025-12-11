import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { Sample, SampleBase } from 'maestro-shared/schema/Sample/Sample';
import React, { FunctionComponent, useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import z from 'zod';
import check from '../../../../assets/illustrations/check.svg';
import warning from '../../../../assets/illustrations/warning.svg';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../../hooks/useForm';
import { ApiClientContext } from '../../../../services/apiClient';

type Props = {
  sample: Sample;
  modal: ReturnType<typeof createModal>;
};
export const SampleAdmissibilityEditModal: FunctionComponent<Props> = ({
  modal,
  sample,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [updateSample] = apiClient.useUpdateSampleMutation();

  const [isReceived, setIsReceived] = useState(
    ['Analysis', 'NotAdmissible', 'Completed'].includes(sample.status)
      ? sample.receivedAt !== undefined
      : undefined
  );
  const [receivedAt, setReceivedAt] = useState(
    sample.receivedAt ? format(sample.receivedAt, 'yyyy-MM-dd') : undefined
  );
  const [isAdmissible, setIsAdmissible] = useState(
    ['Analysis', 'Completed'].includes(sample.status)
      ? true
      : sample.status === 'NotAdmissible'
        ? false
        : undefined
  );
  const [notesOnAdmissibility, setNotesOnAdmissibility] = useState(
    sample.notesOnAdmissibility
  );

  const Form = SampleBase.pick({
    receivedAt: true,
    notesOnAdmissibility: true
  }).merge(
    z.object({
      isReceived: z.boolean({
        message:
          'Veuillez renseigner la notification de réception par le laboratoire.'
      }),
      isAdmissible: z.boolean().nullish()
    })
  );

  const FormRefinement = Form.check((ctx) => {
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

  const form = useForm(FormRefinement, {
    isReceived,
    receivedAt,
    isAdmissible,
    notesOnAdmissibility
  });

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    await updateSample({
      ...sample,
      receivedAt: receivedAt
        ? parse(receivedAt, 'yyyy-MM-dd', new Date())
        : undefined,
      status:
        isAdmissible === false
          ? 'NotAdmissible'
          : sample.status === 'NotAdmissible'
            ? 'Analysis'
            : sample.status,
      notesOnAdmissibility
    } as Sample);
    form.reset();
  };

  return (
    <modal.Component
      title="Modification de la réception par le laboratoire"
      concealingBackdrop={false}
      size={'large'}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          onClick: () => ({}),
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Enregistrer',
          onClick: save,
          doClosesModal: true,
          priority: 'primary'
        }
      ]}
    >
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
                  setReceivedAt(undefined);
                  setIsAdmissible(undefined);
                  setNotesOnAdmissibility(undefined);
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
                  defaultValue={receivedAt}
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
                      setNotesOnAdmissibility('');
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
                      setNotesOnAdmissibility('');
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
      </form>
    </modal.Component>
  );
};
