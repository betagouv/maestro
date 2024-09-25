import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { useMemo } from 'react';
import { PartialSample } from 'shared/schema/Sample/Sample';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { getSupportDocumentURL } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample;
}

const SupportDocumentDownload = ({ partialSample }: Props) => {
  const confirmationModal = useMemo(
    () =>
      createModal({
        id: `document-download-modal-${partialSample.id}-${partialSample.status}`,
        isOpenedByDefault: false,
      }),
    [partialSample]
  );

  return (
    <>
      <div className={clsx('d-flex-align-center', 'flex-grow-1')}>
        <Button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            confirmationModal.open();
          }}
          priority="tertiary no outline"
          iconId="fr-icon-printer-fill"
        >
          Générer le document d'accompagnement
        </Button>
        <div className="border-middle"></div>
      </div>
      <ConfirmationModal
        modal={confirmationModal}
        title="A noter à ce stade de la saisie"
        onConfirm={async () => {
          window.open(getSupportDocumentURL(partialSample?.id, 1), '_blank');
        }}
        confirmLabel="Télécharger"
        closeOnConfirm
      >
        <b>
          Vous vous apprêtez à imprimer un document d’accompagnement incomplet. 
        </b>
        Votre saisie devra être complétée sur maestro pour l’envoi de la demande
        d’analyse au laboratoire.
      </ConfirmationModal>
    </>
  );
};

export default SupportDocumentDownload;
