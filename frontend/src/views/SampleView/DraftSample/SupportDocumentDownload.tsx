import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import React, { useMemo } from 'react';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import useWindowSize from 'src/hooks/useWindowSize';
import { getSupportDocumentURL } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  onConfirm?: () => Promise<void>;
}

const SupportDocumentDownload = ({ partialSample, onConfirm }: Props) => {
  const { isMobile } = useWindowSize();

  const confirmationModal = useMemo(
    () =>
      createModal({
        id: `document-download-modal-${partialSample.id}-${partialSample.status}`,
        isOpenedByDefault: false
      }),
    [partialSample]
  );

  return (
    <>
      <div
        className={clsx(
          'd-flex-align-center',
          'd-flex-justify-center',
          'flex-grow-1'
        )}
      >
        <Button
          onClick={async (e: React.MouseEvent) => {
            e.preventDefault();
            confirmationModal.open();
          }}
          priority="tertiary no outline"
          iconId="fr-icon-printer-fill"
        >
          <div>Générer une étiquette</div>
        </Button>
        {!isMobile && <div className="border-middle"></div>}
      </div>
      <ConfirmationModal
        modal={confirmationModal}
        title="A noter à ce stade de la saisie"
        onConfirm={async () => {
          await onConfirm?.();
          window.open(getSupportDocumentURL(partialSample?.id, 1), '_blank');
        }}
        confirmLabel="Télécharger"
        closeOnConfirm
      >
        <b>
          Vous vous apprêtez à imprimer un document d’accompagnement incomplet.
          {' '}
        </b>
        {!isCreatedPartialSample(partialSample)
          ? 'Le prélèvement va être créé mais votre '
          : 'Votre '}
        saisie devra être complétée sur {Brand} pour l’envoi de la demande
        d’analyse au laboratoire.
      </ConfirmationModal>
    </>
  );
};

export default SupportDocumentDownload;
