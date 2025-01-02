import Button from '@codegouvfr/react-dsfr/Button';
import React, { useState } from 'react';
import { Sample } from 'shared/schema/Sample/Sample';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import ContextStepSummary from 'src/views/SampleView/StepSummary/ContextStepSummary';
import './SampleOverview.scss';
interface Props {
  sample: Sample;
}

const SampleOverviewContextTab = ({ sample }: Props) => {
  const [resytalId, setResytalId] = useState(sample.resytalId);
  const [isSaved, setIsSaved] = useState(false);

  const [updateSample] = useUpdateSampleMutation();

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
        showLabel={false}
        onChangeResytalId={setResytalId}
      />
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
  );
};

export default SampleOverviewContextTab;
