import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import useWindowSize from 'src/hooks/useWindowSize';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { getSupportDocumentURL } from '../../../services/sample.service';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  alignRight?: boolean;
}

const SupportDocumentDownload = ({ partialSample, alignRight }: Props) => {
  const { isMobile } = useWindowSize();
  const { navigateToSample } = useSamplesLink();
  const { trackEvent } = useAnalytics();

  const isSubmittingRef = useRef<boolean>(false);
  const [shouldProcessDownload, setShouldProcessDownload] = useState(false);

  const { useCreateOrUpdateSampleMutation } = useContext(ApiClientContext);

  const confirmationModal = useMemo(
    () =>
      createModal({
        id: `document-download-modal-${partialSample.id}-${partialSample.status}`,
        isOpenedByDefault: false
      }),
    [partialSample]
  );

  const isCompleted = useMemo(
    () => !DraftStatusList.includes(partialSample.status),
    [partialSample]
  );

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    useCreateOrUpdateSampleMutation();

  useEffect(
    () => {
      if (
        shouldProcessDownload ||
        (isSubmittingRef.current && !createOrUpdateSampleCall.isLoading)
      ) {
        isSubmittingRef.current = false;
        setShouldProcessDownload(false);

        if (
          isCreatedPartialSample(partialSample) ||
          createOrUpdateSampleCall.isSuccess
        ) {
          trackEvent(
            'support_document',
            `download_${partialSample.status}`,
            partialSample.id
          );
          navigateToSample(partialSample.id);
          window.open(getSupportDocumentURL(partialSample.id), '_blank');
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      shouldProcessDownload,
      createOrUpdateSampleCall.isSuccess,
      createOrUpdateSampleCall.isLoading,
      partialSample
    ]
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
            if (isCompleted) {
              window.open(getSupportDocumentURL(partialSample.id), '_blank');
            } else {
              confirmationModal.open();
            }
          }}
          priority="tertiary no outline"
          iconId="fr-icon-printer-fill"
        >
          <div>{`${isCompleted ? 'Imprimer' : 'Générer'} les étiquettes`}</div>
        </Button>
        {!isMobile && !alignRight && <div className="border-middle"></div>}
      </div>
      <ConfirmationModal
        modal={confirmationModal}
        title="A noter à ce stade de la saisie"
        onConfirm={async () => {
          if (!isCreatedPartialSample(partialSample)) {
            isSubmittingRef.current = true;
            await createOrUpdateSample(partialSample);
          } else {
            setShouldProcessDownload(true);
          }
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
