import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { useContext } from 'react';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { ApiClientContext } from '../../../../../services/apiClient';
import { AnalysisComplianceForm } from './AnalysisComplianceForm';

interface Props {
  partialAnalysis: PartialAnalysis;
}

const AnalysisComplianceStep = ({ partialAnalysis }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();

  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation({
    fixedCacheKey: `complete-analysis-${partialAnalysis.sampleId}`
  });

  const onSave = async ({
    compliance,
    notesOnCompliance
  }: Pick<Analysis, 'compliance' | 'notesOnCompliance'>) => {
    await updateAnalysis({
      ...partialAnalysis,
      compliance,
      notesOnCompliance,
      status: 'Completed'
    });
    navigateToSample(partialAnalysis.sampleId);
  };

  const onBack = async () => {
    await updateAnalysis({
      ...partialAnalysis,
      status: 'Residues'
    });
    navigateToSample(partialAnalysis.sampleId, 2);
  };

  return (
    <AnalysisComplianceForm
      partialAnalysis={partialAnalysis}
      onSave={onSave}
      onBack={onBack}
    />
  );
};

export default AnalysisComplianceStep;
