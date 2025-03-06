import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useRef, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClient } from '../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import '../../SampleView.scss';
import { AnalysisComplianceForm } from '../SampleDraftAnalysis/AnalysisComplianceStep/AnalysisComplianceForm';
import { AnalysisResiduesForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesForm';
import '../SampleDraftAnalysis/SampleDraftAnalysis.scss';
import { ReviewWithoutResidu } from './ReviewWithoutResidu';
import { ReviewWithResidues } from './ReviewWithResidues';

export interface Props {
  sample: Sample;
  partialAnalysis: Pick<
    PartialAnalysis,
    'id' | 'residues' | 'reportDocumentId'
  >;
  apiClient: Pick<
    ApiClient,
    'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'
  >;
}

type ReviewState = 'Review' | 'Correction' | 'Interpretation';

export const SampleAnalysisReview: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  apiClient,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [analysis, setAnalysis] = useState(
    PartialAnalysis.pick({
      id: true,
      residues: true,
      reportDocumentId: true
    }).parse({
      ...partialAnalysis,
      residues: partialAnalysis.residues ?? []
    })
  );

  const hasResidues = useRef<boolean>(
    !!analysis.residues && analysis.residues.length > 0
  );

  const [reviewState, setReviewState] = useState<ReviewState>('Review');
  const onCorrectAnalysis = (residues: PartialResidue[]) => {
    setAnalysis({ ...analysis, residues });
    setReviewState('Correction');
  };
  const onBackToFirstStep = async () => setReviewState('Review');

  const onValidateCorrection = async (newResidues: Analysis['residues']) => {
    //FIXME on appel la bdd, on met tout dans un state ?!
    setAnalysis({ ...analysis, residues: newResidues });
    hasResidues.current = newResidues.length > 0;
    if (reviewState === 'Correction') {
      await onBackToFirstStep();
    } else {
      setReviewState('Interpretation');
    }
  };
  const onValidateAnalysis = () => {
    //FIXME tout est ok, faut mettre à jour le statut de l'analyse et la compliance à true
  };
  const onValidateInterpretation = async () => {
    //FIXME
  };

  return (
    <div className={clsx('analysis-container')}>
      <AnalysisDocumentPreview
        apiClient={apiClient}
        reportDocumentId={analysis.reportDocumentId}
      />
      <hr />
      {reviewState === 'Review' ? (
        hasResidues.current ? (
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
        )
      ) : null}
      {reviewState === 'Interpretation' ? (
        <AnalysisComplianceForm
          onBack={onBackToFirstStep}
          onSave={onValidateInterpretation}
          partialAnalysis={{
            compliance: undefined,
            notesOnCompliance: undefined
          }}
        />
      ) : null}
      {reviewState === 'Correction' ? (
        <AnalysisResiduesForm
          onBack={onBackToFirstStep}
          onValidate={onValidateCorrection}
          partialAnalysis={analysis}
        />
      ) : null}
    </div>
  );
};
