import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClient } from '../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import '../../SampleView.scss';
import '../SampleDraftAnalysis/SampleDraftAnalysis.scss';
import { ReviewWithoutResidu } from './ReviewWithoutResidu';
import { AnalysisComplianceForm } from '../SampleDraftAnalysis/AnalysisComplianceStep/AnalysisComplianceForm';
import { AnalysisResiduesForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesForm';

export interface Props {
  sample: Sample;
  partialAnalysis: Pick<PartialAnalysis, 'id' | 'residues' | 'reportDocumentId'>;
  apiClient: Pick<
    ApiClient,
    'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'
  >;
  initialReviewState?: ReviewState;
}

type ReviewState =
  | 'ReviewWithoutResidu'
  | 'ReviewWithResidu'
  | 'Correction'
  | 'Interpretation';

export const SampleAnalysisReview: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  apiClient,
  initialReviewState,
  ...rest
}) => {
  assert<Equals<keyof typeof rest, never>>();



  const [analysis, setAnalysis] = useState(Analysis.pick({
    id:true,
    residues: true,
    reportDocumentId: true
  }).parse({
    ...partialAnalysis,
    residues: partialAnalysis.residues ?? []
  }))

  const getInitialState = (residues: unknown[]) =>
    residues.length > 0 ? 'ReviewWithResidu' : 'ReviewWithoutResidu';

  const [reviewState, setReviewState] = useState<ReviewState>(
    initialReviewState ?? getInitialState(analysis.residues)
  );

  const onCorrectAnalysis = () => setReviewState('Correction');
  const onBackToFirstStep = async () =>
    setReviewState(getInitialState(analysis.residues));
  const onValidateCorrection = async (newResidues: Analysis['residues']) => {
    //FIXME on appel la bdd, on met tout dans un state ?!
    setAnalysis({...analysis, residues: newResidues})
    await onBackToFirstStep()
  }
  const onValidateAnalysis = () => {
    //FIXME tout est ok, faut mettre à jour le statut de l'analyse et la compliance à true
  }
  const onValidateInterpretation = async () => {
    //FIXME
  }

  return (
    <div {...rest} className={clsx('analysis-container')}>
      <AnalysisDocumentPreview
        apiClient={apiClient}
        reportDocumentId={analysis.reportDocumentId}
      />
      <hr />
      {reviewState === 'ReviewWithoutResidu' ? (
        <ReviewWithoutResidu
          onValidateAnalysis={onValidateAnalysis}
          onCorrectAnalysis={onCorrectAnalysis}
        />
      ) : null}
      {reviewState === 'Interpretation' ? ( <AnalysisComplianceForm onBack={onBackToFirstStep} onSave={onValidateInterpretation} partialAnalysis={{compliance: undefined, notesOnCompliance:undefined }}/>
    ) : null}
      {reviewState === 'Correction' ? <AnalysisResiduesForm onBack={onBackToFirstStep} onValidate={onValidateCorrection} partialAnalysis={analysis} /> : null}
    </div>
  );
};
