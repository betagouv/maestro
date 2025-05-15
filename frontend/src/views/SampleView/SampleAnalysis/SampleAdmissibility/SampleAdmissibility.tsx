import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import React, { useContext, useMemo, useState } from 'react';
import check from 'src/assets/illustrations/check.svg';
import warning from 'src/assets/illustrations/warning.svg';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useForm } from 'src/hooks/useForm';
import z from 'zod';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../../services/apiClient';
import './SampleAdmissibility.scss';

interface Props {
  sample: Sample;
}
const SampleAdmissibility = ({ sample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();

  const [updateSample] = apiClient.useUpdateSampleMutation();

  const [isReceived, setIsReceived] = useState(
    ['Analysis', 'NotAdmissible', 'Completed'].includes(
      sample.status
    )
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
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const nonAdmissibleConfirmationModal = useMemo(
    () =>
      createModal({
        id: `non-admissible-confirmation-modal-${sample.id}`,
        isOpenedByDefault: false
      }),
    [sample.id]
  );

  const Form = Sample.pick({
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

  const FormRefinement = Form.superRefine((val, ctx) => {
    if (val.isReceived && !val.receivedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez renseigner la date de réception.',
        path: ['receivedAt']
      });
    }
    if (val.isReceived && val.isAdmissible === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      if (isAdmissible === false) {
        nonAdmissibleConfirmationModal.open();
      } else {
        await save();
      }
    });
  };

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    await updateSample({
      ...sample,
      receivedAt: receivedAt
        ? parse(receivedAt, 'yyyy-MM-dd', new Date())
        : undefined,
      status: isAdmissible === false ? 'NotAdmissible' : 'Analysis',
      notesOnAdmissibility
    } as Sample);
    form.reset();
  };

  const readonly = useMemo(
    () => !hasUserPermission('createAnalysis'),
    [hasUserPermission]
  );

  return (
    <form
      className={clsx(
        cx(
          'fr-callout',
          ['Analysis', 'Completed'].includes(sample.status)
            ? 'fr-callout--green-emeraude'
            : 'fr-callout--pink-tuile'
        ),
        'sample-callout'
      )}
    >
      {sample.status === 'Sent' && (
        <>
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
            disabled={readonly}
            required
          />
          {isReceived && (
            <>
              <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                  <AppTextInput<FormShape>
                    type="date"
                    defaultValue={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                    inputForm={form}
                    inputKey="receivedAt"
                    whenValid="Date de réception correctement renseignée."
                    label="Date de réception"
                    hintText="Format attendu › JJ/MM/AAAA"
                    disabled={readonly}
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
                      onChange: () => setIsAdmissible(true)
                    },
                    illustration: <img src={check} alt="" aria-hidden />
                  },
                  {
                    label: 'Non recevable',
                    nativeInputProps: {
                      checked: isAdmissible === false,
                      onChange: () => {
                        setIsAdmissible(false);
                        setNotesOnAdmissibility(undefined);
                      }
                    },
                    illustration: <img src={warning} alt="" aria-hidden />
                  }
                ]}
                colSm={6}
                inputForm={form}
                inputKey="isAdmissible"
                whenValid="Recevabilité correctement renseignée."
                disabled={readonly || sample.receivedAt !== undefined}
                required
              />
              {isAdmissible === false && (
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppTextAreaInput<FormShape>
                      rows={1}
                      defaultValue={notesOnAdmissibility ?? ''}
                      onChange={(e) => setNotesOnAdmissibility(e.target.value)}
                      inputForm={form}
                      inputKey="notesOnAdmissibility"
                      whenValid="Motif de non-recevabilité correctement renseigné."
                      label="Motif de non-recevabilité"
                      hintText="Champ facultatif pour précisions supplémentaires"
                      disabled={readonly}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {!readonly && (
            <>
              <Button type="submit" className="fr-m-0" onClick={submit}>
                Enregistrer
              </Button>
              <ConfirmationModal
                modal={nonAdmissibleConfirmationModal}
                title="Confirmez que l’échantillon est non-recevable"
                onConfirm={save}
                closeOnConfirm
              >
                La notification du laboratoire vous informe que l’échantillon
                reçu est non-recevable pour l’analyse.
              </ConfirmationModal>
            </>
          )}
        </>
      )}
      {['Analysis', 'NotAdmissible', 'Completed'].includes(
        sample.status
      ) && (
        <div className="admissibility-result">
          <h4 className={cx('fr-mb-0')}>Recevabilité par le laboratoire</h4>
          {sample.receivedAt ? (
            <>
              <div className={cx('fr-text--md', 'fr-text--regular')}>
                Prélèvement reçu par le laboratoire le{' '}
                {format(sample.receivedAt, 'dd MMMM yyyy', { locale: fr })}
              </div>
              <div>
                {sample.status !== 'NotAdmissible' ? (
                  <>
                    <span
                      className={cx(
                        'fr-icon-success-fill',
                        'fr-label--success',
                        'fr-mr-1w'
                      )}
                    />
                    Échantillon recevable
                  </>
                ) : (
                  <>
                    <div>
                      <span
                        className={cx(
                          'fr-icon-error-fill',
                          'fr-label--error',
                          'fr-mr-1w'
                        )}
                      />
                      Échantillon non recevable
                    </div>
                    <div
                      className={clsx(cx('fr-pl-4w'), 'admissibility-notes')}
                    >
                      {isEditingNotes ? (
                        <div className={cx('fr-mt-1w')}>
                          <AppTextAreaInput<FormShape>
                            rows={1}
                            defaultValue={notesOnAdmissibility ?? ''}
                            onChange={(e) =>
                              setNotesOnAdmissibility(e.target.value)
                            }
                            inputForm={form}
                            inputKey="notesOnAdmissibility"
                            whenValid="Motif de non-recevabilité correctement renseigné."
                            label="Motif de non-recevabilité"
                            hintText="Champ facultatif pour précisions supplémentaires"
                          />
                          <Button
                            type="submit"
                            onClick={async (e) => {
                              await save(e);
                              setIsEditingNotes(false);
                            }}
                            className={cx('fr-mt-0')}
                          >
                            Enregistrer
                          </Button>
                        </div>
                      ) : (
                        <>
                          <i className={cx('fr-text--md', 'fr-text--regular')}>
                            {sample.notesOnAdmissibility ??
                              'Motif non renseigné'}
                          </i>
                          <Button
                            priority="tertiary no outline"
                            onClick={() => setIsEditingNotes(!isEditingNotes)}
                            className={cx('fr-mt-0')}
                          >
                            Modifier
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <i>Notification non reçue</i>
          )}
        </div>
      )}
    </form>
  );
};

export default SampleAdmissibility;
