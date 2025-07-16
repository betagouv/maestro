import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { useContext } from 'react';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { ApiClientContext } from '../../../../../services/apiClient';
import '../SampleDraftAnalysis.scss';
import { AnalysisResiduesForm } from './AnalysisResiduesForm';

interface Props {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
}

const AnalysisResiduesStep = ({ sample, partialAnalysis }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation();

  const onSubmit = async (residues: Analysis['residues']) => {
    await updateAnalysis({
      ...partialAnalysis,
      residues,
      status: 'Compliance'
    });
    navigateToSample(partialAnalysis.sampleId, 3);
  };

  const onBack = async () => {
    await updateAnalysis({
      ...partialAnalysis,
      status: 'Report'
    });
    navigateToSample(partialAnalysis.sampleId, 1);
  };

  return (
    <AnalysisResiduesForm
      sample={sample}
      partialAnalysis={partialAnalysis}
      onValidate={onSubmit}
      onBack={onBack}
    />
  );
};

export default AnalysisResiduesStep;
