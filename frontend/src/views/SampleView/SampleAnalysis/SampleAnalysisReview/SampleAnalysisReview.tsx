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

export interface Props {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
  apiClient: Pick<
    ApiClient,
    'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'
  >;
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
  ...rest
}) => {
  assert<Equals<keyof typeof rest, never>>();

  const analysis = Analysis.omit({ compliance: true }).parse({
    ...partialAnalysis,
    residues: partialAnalysis.residues ?? []
  });

  const [reviewState, setReviewState] = useState<ReviewState>(
    analysis.residues?.length > 0 ? 'ReviewWithResidu' : 'ReviewWithoutResidu'
  );

  const onCorrectAnalysis = () => setReviewState('Correction');
  const onCorrectAnalysisDone = () =>
    setReviewState(
      analysis.residues?.length > 0 ? 'ReviewWithResidu' : 'ReviewWithoutResidu'
    );
  const onValidateAnalysis = () => setReviewState('Interpretation');

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
    </div>
  );
};
