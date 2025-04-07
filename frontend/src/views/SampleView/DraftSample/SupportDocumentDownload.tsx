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
import {
  getSupportDocumentURL,
  useCreateOrUpdateSampleMutation
} from 'src/services/sample.service';
import { useSamplesLink } from '../../../hooks/useSamplesLink';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const SupportDocumentDownload = ({ partialSample }: Props) => {
  const { isMobile } = useWindowSize();
  const { navigateToSample } = useSamplesLink();

  const confirmationModal = useMemo(
    () =>
      createModal({
        id: `document-download-modal-${partialSample.id}-${partialSample.status}`,
        isOpenedByDefault: false
      }),
    [partialSample]
  );

  const [createOrUpdateSample] = useCreateOrUpdateSampleMutation();

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
          <div>Générer les étiquettes</div>
        </Button>
        {!isMobile && <div className="border-middle"></div>}
      </div>
      <ConfirmationModal
        modal={confirmationModal}
        title="A noter à ce stade de la saisie"
        onConfirm={async () => {
          const win1 = window.open('', '_blank');
          const win2 = window.open('', '_blank');
          const win3 = window.open('', '_blank');

          await (async () => {
            if (!isCreatedPartialSample(partialSample)) {
              await createOrUpdateSample(partialSample);
            }
            win1?.location?.replace(getSupportDocumentURL(partialSample.id, 1));
            win2?.location?.replace(getSupportDocumentURL(partialSample.id, 2));
            win3?.location?.replace(getSupportDocumentURL(partialSample.id, 3));
            navigateToSample(partialSample.id);
          })();
        }}
        confirmLabel="Télécharger"
        closeOnConfirm
      >
        <b>Vous vous apprêtez à imprimer des étiquettes incomplètes.</b>
        <br />
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
