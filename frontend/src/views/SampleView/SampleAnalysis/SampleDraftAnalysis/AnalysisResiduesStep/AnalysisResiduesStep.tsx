import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
import '../SampleDraftAnalysis.scss';
import { AnalysisResiduesForm } from './AnalysisResiduesForm';

interface Props {
  partialAnalysis: PartialAnalysis;
}

const AnalysisResiduesStep = ({ partialAnalysis }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const [updateAnalysis] = useUpdateAnalysisMutation();

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
      partialAnalysis={partialAnalysis}
      onValidate={onSubmit}
      onBack={onBack}
    />
  );
};

export default AnalysisResiduesStep;
