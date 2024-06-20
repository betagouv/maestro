import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import React, { useMemo } from 'react';
import { Laboratory } from 'shared/schema/Laboratory/Laboratory';
import { PartialSample } from 'shared/schema/Sample/Sample';
interface Props {
  sample: PartialSample;
  laboratory: Laboratory;
  onConfirm: () => Promise<void>;
}

const SampleSendModal = ({ sample, laboratory, onConfirm }: Props) => {
  const sendSampleModal = useMemo(
    () =>
      createModal({
        id: `send-sample-modal-${sample.id}`,
        isOpenedByDefault: false,
      }),
    [sample.id]
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <>
      <Button
        iconId="fr-icon-send-plane-fill"
        iconPosition="right"
        priority="primary"
        onClick={sendSampleModal.open}
      >
        Envoyer la demande d’analyse
      </Button>
      <sendSampleModal.Component
        title="Vous vous apprêtez à envoyer un prélèvement"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
          },
          {
            children: "Confirmer l'envoi",
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        La demande d’analyse va être envoyée au laboratoire{' '}
        <b>{laboratory.name}</b> par e-mail à l’adresse{' '}
        <b>{laboratory.email}</b>.
      </sendSampleModal.Component>
    </>
  );
};

export default SampleSendModal;
