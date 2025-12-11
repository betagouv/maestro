import Button from '@codegouvfr/react-dsfr/Button';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import React, { useContext, useState } from 'react';
import ContextStepSummary from 'src/views/SampleView/StepSummary/ContextStepSummary';
import { usePartialSample } from '../../../hooks/usePartialSample';
import { ApiClientContext } from '../../../services/apiClient';
import SavedAlert from '../SavedAlert';
import './SampleOverview.scss';
interface Props {
  sample: Sample;
}

const SampleOverviewContextTab = ({ sample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { readonly } = usePartialSample(sample);

  const [resytalId, setResytalId] = useState(sample.resytalId);
  const [isSaved, setIsSaved] = useState(false);

  const [updateSample] = apiClient.useUpdateSampleMutation();

  const save = async () => {
    await updateSample({
      ...sample,
      resytalId
    });
  };

  return (
    <>
      <ContextStepSummary
        sample={sample}
        mode="tab"
        onChangeResytalId={setResytalId}
      />
      {!readonly && (
        <>
          <hr />
          <div>
            <Button
              onClick={async (e: React.MouseEvent<HTMLElement>) => {
                e.preventDefault();
                await save();
                setIsSaved(true);
              }}
              iconId="fr-icon-save-line"
              iconPosition="right"
              className="float-right"
            >
              Enregistrer
            </Button>
          </div>
          <SavedAlert isOpen={isSaved} />
        </>
      )}
    </>
  );
};

export default SampleOverviewContextTab;
