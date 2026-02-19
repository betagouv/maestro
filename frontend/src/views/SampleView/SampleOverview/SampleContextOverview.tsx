import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { useContext } from 'react';
import ContextStepSummary from 'src/views/SampleView/StepSummary/ContextStepSummary';
import { ApiClientContext } from '../../../services/apiClient';
import './SampleOverview.scss';
interface Props {
  sample: SampleChecked;
}

const SampleContextOverview = ({ sample }: Props) => {
  const apiClient = useContext(ApiClientContext);

  const [updateSample] = apiClient.useUpdateSampleMutation();

  const updateResytalId = (newResytalId: string) => {
    updateSample({
      ...sample,
      resytalId: newResytalId
    });
  };

  return (
    <ContextStepSummary
      sample={sample}
      mode="tab"
      onChangeResytalId={updateResytalId}
    />
  );
};

export default SampleContextOverview;
