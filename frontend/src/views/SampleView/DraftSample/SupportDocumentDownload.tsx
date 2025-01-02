import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'shared/schema/Sample/Sample';
import AlertModal from 'src/components/AlertModal/AlertModal';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import useWindowSize from 'src/hooks/useWindowSize';
import { getSupportDocumentURL } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  missingData?: boolean;
  onConfirm?: () => void;
}

const SupportDocumentDownload = ({
  partialSample,
  missingData,
  onConfirm
}: Props) => {
  const { isMobile } = useWindowSize();

  const confirmationModal = useMemo(
    () =>
      createModal({
        id: `document-download-modal-${partialSample.id}-${partialSample.status}`,
        isOpenedByDefault: false
      }),
    [partialSample]
  );

  const alertModal = useMemo(
    () =>
      createModal({
        id: `document-download-alert-modal-${partialSample.id}-${partialSample.status}`,
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
            if (missingData) {
              alertModal.open();
            } else {
              confirmationModal.open();
            }
          }}
          priority="tertiary no outline"
          iconId="fr-icon-printer-fill"
        >
          <div>
            Générer le document 
            {isMobile && <br />}
            d'accompagnement
          </div>
        </Button>
        {!isMobile && <div className="border-middle"></div>}
      </div>

      {missingData ? (
        <AlertModal
          modal={alertModal}
          title="Informations manquantes"
          closeLabel="J'ai compris"
        >
          Il manque des informations liées au contexte du prélèvement pour
          générer le document d’accompagnement.
        </AlertModal>
      ) : (
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
            Vous vous apprêtez à imprimer un document d’accompagnement
            incomplet. 
          </b>
          {!isCreatedPartialSample(partialSample)
            ? 'Le prélèvement va être créé mais votre '
            : 'Votre '}
          saisie devra être complétée sur maestro pour l’envoi de la demande
          d’analyse au laboratoire.
        </ConfirmationModal>
      )}
    </>
  );
};

export default SupportDocumentDownload;
