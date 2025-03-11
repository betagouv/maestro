import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { CompletedStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { FunctionComponent, useContext, useState } from 'react';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import SampleAdmissibility from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import SampleAnalysisOverview from 'src/views/SampleView/SampleAnalysis/SampleAnalysisOverview/SampleAnalysisOverview';
import SampleDraftAnalysis from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/SampleDraftAnalysis';
import { SampleAnalysisReview } from './SampleAnalysisReview/SampleAnalysisReview';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';

export interface Props {
  sample: Sample;
}

const SampleAnalysis: FunctionComponent<Props> = ({ sample } ) => {
  const apiClient = useContext(ApiClientContext)

  const { laboratory } = usePartialSample(sample);
  const {navigateToSample} = useSamplesLink()
  const [, { isSuccess: isSendingSuccess }] = apiClient.useUpdateSampleMutation(
    {
      fixedCacheKey: `sending-sample-${sample.id}`
    }
  );
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    apiClient.useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`
    });
  const { data: analysis } = apiClient.useGetSampleAnalysisQuery(sample.id);

  const dateFormat = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  })
  const [receivedAt] = useState(
    sample.receivedAt ? dateFormat.format(sample.receivedAt) : undefined
  );

  const [continueToAnalysis, setContinueToAnalysis] = useState(false);

  return (
    <div>
      {isSendingSuccess && laboratory && (
        <Alert
          severity="info"
          small
          description={`Votre demande d’analyse a bien été transmise au laboratoire ${laboratory.name} par e-mail.`}
          className={cx('fr-mb-4w')}
        />
      )}
      {CompletedStatusList.includes(sample.status) &&
        isCompletingAnalysisSuccess && (
          <Alert
            severity="info"
            small
            description="Les résultats d’analyse ont bien été enregistrés."
            className={cx('fr-mb-4w')}
          />
        )}
      <div className="section-header">
        <div>
          <h3>
            <div className="sample-status">
              <div>Suivi du prélèvement</div>
              <div>
                <SampleStatusBadge status={sample.status} />
              </div>
            </div>
            {![...CompletedStatusList, 'NotAdmissible'].includes(
              sample.status
            ) && analysis?.status !== 'InReview' && (
              <div
                className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-1w')}
              >
                Renseignez ci-dessous le suivi d’analyse par le laboratoire
              </div>
            )}
            <div className={clsx(cx('fr-mb-1w'), 'd-flex-align-center')}>
              <span
                className={cx(
                  'fr-icon-success-fill',
                  'fr-label--success',
                  'fr-mr-1w'
                )}
              />
              <span
                className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-0')}
              >
                Échantillon recevable et reçu par le laboratoire le {receivedAt}
              </span>
            </div>
          </h3>
        </div>
      </div>
      {analysis?.status !== 'InReview' ? (
        <SampleAdmissibility sample={sample} />
      ) : null}
      {sample.status === 'Analysis' && !analysis && !continueToAnalysis ? (
        <Button
          iconId="fr-icon-arrow-down-line"
          iconPosition="right"
          className="fr-m-0"
          onClick={() => setContinueToAnalysis(true)}
        >
          Saisir le résultat
        </Button>
      ) : (
        <>
          {['Analysis',  ...CompletedStatusList].includes(
            sample.status
          ) && (
            <div
              className={clsx(
                cx(
                  'fr-callout',
                  CompletedStatusList.includes(sample.status) || analysis?.status === 'InReview'
                    ? 'fr-callout--green-emeraude'
                    : 'fr-callout--pink-tuile'
                ),
                'sample-callout',
                'analysis-container',
                'fr-mt-5w'
              )}
            >
              {sample.status === 'Analysis' &&
                (analysis?.status === 'InReview' ? <SampleAnalysisReview
                    sample={sample}
                    partialAnalysis={analysis}
                    onReviewDone={() => navigateToSample(sample.id)}
                  /> :
                <SampleDraftAnalysis sample={sample} />
              )}
              {CompletedStatusList.includes(sample.status) && (
                <SampleAnalysisOverview sample={sample} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SampleAnalysis;
