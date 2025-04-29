import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import '../../SampleView.scss';
import { AnalysisComplianceForm } from '../SampleDraftAnalysis/AnalysisComplianceStep/AnalysisComplianceForm';
import { AnalysisResiduesForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesForm';
import '../SampleDraftAnalysis/SampleDraftAnalysis.scss';
import { ReviewWithoutResidu } from './ReviewWithoutResidu';
import { ReviewWithResidues } from './ReviewWithResidues';

export interface Props {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
  onReviewDone: () => void;
}

type ReviewState = 'Review' | 'Correction' | 'Interpretation';

export const SampleAnalysisReview: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  onReviewDone,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext)

  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation({
    fixedCacheKey: `review-analysis-${sample.id}`
  });

  const [analysis, setAnalysis] = useState(
    PartialAnalysis.parse({
      ...partialAnalysis,
      residues: partialAnalysis.residues ?? []
    })
  );

  const [hasResidues, setHasResidues] = useState<boolean>(
    !!analysis.residues && analysis.residues.length > 0
  );

  const [reviewState, setReviewState] = useState<ReviewState>('Review');

  const containerRef = useRef<null | HTMLDivElement>(null);

  const hasPageBeenRendered = useRef(false);
  useEffect(() => {
    if (hasPageBeenRendered.current) {
      containerRef.current?.scrollIntoView(true);
    }
    setHasResidues((analysis.residues ?? []).length > 0);

    hasPageBeenRendered.current = true;
  }, [reviewState, analysis]);

  const onCorrectAnalysis = (residues: PartialResidue[]) => {
    setAnalysis({ ...analysis, residues });
    setReviewState('Correction');
  };
  const onBackToFirstStep = async () => {
    setAnalysis({...analysis, residues: analysis.residues?.filter(({analysisMethod}) => analysisMethod !== undefined) ?? []})
    setReviewState('Review');
  };

  const onValidateCorrection = async (newResidues: Analysis['residues']) => {
    setAnalysis({ ...analysis, residues: newResidues });
    if (reviewState === 'Correction') {
      setReviewState('Review');
    } else {
      setReviewState('Interpretation');
    }
  };
  const onValidateAnalysis = async () => {
    const newAnalysis: PartialAnalysis = {
      ...analysis,
      compliance: true,
      status: 'Completed'
    };
    setAnalysis(newAnalysis);
    await onSave(newAnalysis);
  };
  const onValidateInterpretation = async ({
    compliance,
    notesOnCompliance
  }: Pick<Analysis, 'compliance' | 'notesOnCompliance'>) => {
    const newAnalysis: PartialAnalysis = {
      ...analysis,
      compliance,
      status: 'Completed',
      notesOnCompliance
    };
    setAnalysis(newAnalysis);
    await onSave(newAnalysis);
  };

  const onSave = async (analyseToSave: PartialAnalysis): Promise<void> => {
    await updateAnalysis(analyseToSave);
    onReviewDone();
  };

  return (
    <div className={clsx('analysis-container')} ref={containerRef}>
      <AnalysisDocumentPreview
        reportDocumentId={analysis.reportDocumentId}
      />
      <hr />
      {reviewState === 'Review' &&
        (hasResidues ? (
          <ReviewWithResidues
            analysis={analysis}
            onCorrectAnalysis={onCorrectAnalysis}
            onGoToInterpretation={onValidateCorrection}
          />
        ) : (
          <ReviewWithoutResidu
            partialAnalysis={partialAnalysis}
            onValidateAnalysis={onValidateAnalysis}
            onCorrectAnalysis={onCorrectAnalysis}
          />
        ))}
      {reviewState === 'Interpretation' && (
        <AnalysisComplianceForm
          onBack={onBackToFirstStep}
          onSave={onValidateInterpretation}
          partialAnalysis={{
            compliance: undefined,
            notesOnCompliance: partialAnalysis.notesOnCompliance
          }}
        />
      )}
      {reviewState === 'Correction' && (
        <AnalysisResiduesForm
          onBack={onBackToFirstStep}
          onValidate={onValidateCorrection}
          partialAnalysis={analysis}
        />
      )}
    </div>
  );
};
