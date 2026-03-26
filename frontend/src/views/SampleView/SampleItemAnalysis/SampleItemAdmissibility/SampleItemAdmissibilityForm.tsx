import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format } from 'date-fns';
import { isNil } from 'lodash-es';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type { MaestroDate } from 'maestro-shared/utils/date';
import { checkSchema } from 'maestro-shared/utils/zod';
import { type FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import z from 'zod';
import check from '../../../../assets/illustrations/check.svg';
import warning from '../../../../assets/illustrations/warning.svg';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../../hooks/useForm';

const FormChecked = checkSchema(
  z.object({
    ...SampleItem.pick({
      receiptDate: true,
      notesOnAdmissibility: true
    }).shape,
    isReceived: z.boolean({
      message:
        'Veuillez renseigner la notification de réception par le laboratoire.'
    }),
    isAdmissible: z.boolean().nullish()
  }),
  (ctx) => {
    const val = ctx.value;
    if (val.isReceived && !val.receiptDate) {
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
  }
);

export type FormRefinement = ReturnType<typeof useForm<typeof FormChecked>>;
type Props = {
  sampleItem: SampleItem;
  setForm?: (form: FormRefinement) => void;
};
export const SampleItemAdmissibilityForm: FunctionComponent<Props> = ({
  sampleItem,
  setForm,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [isReceived, setIsReceived] = useState(
    sampleItem.receiptDate !== undefined
  );
  const [receiptDate, setReceiptDate] = useState(sampleItem.receiptDate);
  const [isAdmissible, setIsAdmissible] = useState(
    sampleItem.analysis?.status === 'NotAdmissible'
      ? false
      : !isNil(sampleItem.analysis?.status)
        ? true
        : null
  );
  const [notesOnAdmissibility, setNotesOnAdmissibility] = useState(
    sampleItem.notesOnAdmissibility
  );

  const form = useForm(FormChecked, {
    isReceived,
    receiptDate,
    isAdmissible,
    notesOnAdmissibility
  });
  setForm?.(form);

  return (
    <form
      className={clsx(
        'border',
        cx(
          'fr-callout',
          isAdmissible ? 'fr-callout--green-emeraude' : 'fr-callout--pink-tuile'
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
                setReceiptDate(format(new Date(), 'yyyy-MM-dd') as MaestroDate);
              }
            }
          },
          {
            label: 'Notification non reçue',
            nativeInputProps: {
              checked: isReceived === false,
              onChange: () => {
                setIsReceived(false);
                setReceiptDate(null);
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
                defaultValue={receiptDate ?? ''}
                onChange={(e) =>
                  setReceiptDate(e.target.value as MaestroDate | null)
                }
                inputForm={form}
                inputKey="receiptDate"
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
    </form>
  );
};
