import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import useWindowSize from 'src/hooks/useWindowSize';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import {
  getSampleEmptyFormURL,
  getSupportDocumentURL
} from '../../../services/sample.service';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

export const SampleEmptyFormDownload = ({ partialSample }: Props) => {
  const { isMobile } = useWindowSize();
  const { navigateToSample } = useSamplesLink();

  const isSubmittingRef = useRef<boolean>(false);
  const [shouldProcessDownload, setShouldProcessDownload] = useState(false);

  const { useCreateOrUpdateSampleMutation } = useContext(ApiClientContext);

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
          navigateToSample(partialSample.id);
          window.open(getSampleEmptyFormURL(partialSample.id), '_blank');
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
        <span className={clsx(cx('fr-text--bold'))}>
          Besoin d'un formulaire vierge ?
        </span>

        {!isMobile && <div className="border-middle"></div>}
        <Button
          onClick={async (e: React.MouseEvent) => {
            e.preventDefault();
            if (isCompleted) {
              window.open(getSupportDocumentURL(partialSample.id), '_blank');
            } else {
              if (!isCreatedPartialSample(partialSample)) {
                isSubmittingRef.current = true;
                await createOrUpdateSample(partialSample);
              } else {
                setShouldProcessDownload(true);
              }
            }
          }}
          priority="tertiary"
          iconId="fr-icon-printer-fill"
        >
          Imprimer un formulaire vierge
        </Button>
      </div>
    </>
  );
};
