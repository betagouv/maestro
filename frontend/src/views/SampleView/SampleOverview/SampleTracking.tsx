import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Sample } from 'shared/schema/Sample/Sample';
import { isAdmissibleStatus } from 'shared/schema/Sample/SampleStatus';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import z from 'zod';
import check from '../../../assets/illustrations/check.svg';
import warning from '../../../assets/illustrations/warning.svg';

interface Props {
  sample: Sample;
}
const SampleTracking = ({ sample }: Props) => {
  const [updateSample] = useUpdateSampleMutation();
  const [, { isSuccess: isSendingSuccess }] = useUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`,
  });
  const { data: laboratory } = useGetLaboratoryQuery(sample.laboratoryId, {
    skip: !isSendingSuccess,
  });

  const [receivedAt, setReceivedAt] = useState(
    format(sample.receivedAt ?? new Date(), 'yyyy-MM-dd')
  );
  const [isAdmissible, setIsAdmissible] = useState<boolean | null>(
    isAdmissibleStatus(sample.status) ?? null
  );
  const [notesOnAdmissibility, setNotesOnAdmissibility] = useState(
    sample.notesOnAdmissibility
  );

  const Form = Sample.pick({
    receivedAt: true,
    notesOnAdmissibility: true,
  }).merge(
    z.object({
      isAdmissible: z.boolean({
        message: 'Veuillez renseigner la recevabilité du prélèvement.',
      }),
    })
  );

  const nonAdmissibleConfirmationModal = useMemo(
    () =>
      createModal({
        id: `non-admissible-confirmation-modal-${sample.id}`,
        isOpenedByDefault: false,
      }),
    [sample.id]
  );

  const form = useForm(Form, {
    receivedAt,
    isAdmissible,
    notesOnAdmissibility,
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

  const save = async () => {
    await updateSample({
      ...sample,
      receivedAt: parse(receivedAt, 'yyyy-MM-dd', new Date()),
      status: isAdmissible ? 'Analysis' : 'NotAdmissible',
      notesOnAdmissibility,
    });
    form.reset();
  };

  return (
    <div>
      {isSendingSuccess && laboratory && (
        <Alert
          severity="info"
          small
          description={`Votre demande d’analyse a bien été transmise au laboratoire ${laboratory.name} par e-mail.`}
          className={cx('fr-mb-4w')}
        />
      )}
      <div className="section-header">
        <div>
          <h3>
            <div className="sample-status">
              <div>Statut du prélèvement</div>
              <div>
                <SampleStatusBadge status={sample.status} />
              </div>
            </div>
            <div className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-1w')}>
              Renseignez ci-dessous le suivi d’analyse par le laboratoire
            </div>
          </h3>
        </div>
      </div>
      <form
        className={clsx(
          cx(
            'fr-callout',
            sample.status === 'Sent'
              ? 'fr-callout--pink-tuile'
              : 'fr-callout--green-emeraude'
          ),
          'sample-callout'
        )}
      >
        <h4 className={cx('fr-mb-0')}>
          <div className={cx('fr-label--error', 'fr-text--sm')}>ETAPE 1</div>
          Accusé de réception
          <div className={cx('fr-text--md', 'fr-text--regular')}>
            Complétez les champs suivant à réception de la notification par le
            laboratoire
          </div>
        </h4>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppTextInput<FormShape>
              type="date"
              defaultValue={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              inputForm={form}
              inputKey="receivedAt"
              whenValid="Date de notification correctement renseignée."
              label="Date de notification"
              hintText="Format attendu › JJ/MM/AAAA"
              disabled={sample.status !== 'Sent'}
              required
            />
          </div>
        </div>
        <AppRadioButtons<FormShape>
          legend="Échantillon"
          options={[
            {
              label: 'Recevable',
              nativeInputProps: {
                checked: isAdmissible === true,
                onChange: () => setIsAdmissible(true),
              },
              illustration: <img src={check} alt="" aria-hidden />,
            },
            {
              label: 'Non recevable',
              nativeInputProps: {
                checked: isAdmissible === false,
                onChange: () => {
                  setIsAdmissible(false);
                  setNotesOnAdmissibility('');
                },
              },
              illustration: <img src={warning} alt="" aria-hidden />,
            },
          ]}
          colSm={6}
          inputForm={form}
          inputKey="isAdmissible"
          whenValid="Recevabilité correctement renseignée."
          disabled={sample.status !== 'Sent'}
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
                data-testid="notes-input"
                label="Motif de non-recevabilité"
                hintText="Champ facultatif pour précisions supplémentaires"
                disabled={sample.status !== 'Sent'}
              />
            </div>
          </div>
        )}
        {sample.status === 'Sent' && (
          <Button
            type="submit"
            iconId="fr-icon-arrow-down-line"
            iconPosition="right"
            className="fr-m-0"
            onClick={submit}
          >
            Confirmer
          </Button>
        )}
      </form>
      {/*<form*/}
      {/*  className={clsx(*/}
      {/*    cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mt-5w'),*/}
      {/*    'sample-callout'*/}
      {/*  )}*/}
      {/*>*/}
      {/*  <h4 className={cx('fr-mb-0')}>*/}
      {/*    <div className={cx('fr-label--disabled', 'fr-text--sm')}>ETAPE 2</div>*/}
      {/*    Saisie des résultats d’analyse*/}
      {/*    <div className={cx('fr-text--md', 'fr-text--regular')}>*/}
      {/*      En attente de l’accusé de réception*/}
      {/*    </div>*/}
      {/*  </h4>*/}
      {/*</form>*/}
      <ConfirmationModal
        modal={nonAdmissibleConfirmationModal}
        title="Confirmez que l’échantillon est non-recevable"
        onConfirm={save}
      >
        La notification du laboratoire vous informe que l’échantillon reçu est
        non-recevable pour l’analyse.
      </ConfirmationModal>
    </div>
  );
};

export default SampleTracking;
