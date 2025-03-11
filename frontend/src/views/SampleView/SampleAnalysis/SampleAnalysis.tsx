import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { CompletedStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { FunctionComponent, useState } from 'react';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import SampleAdmissibility from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import SampleAnalysisOverview from 'src/views/SampleView/SampleAnalysis/SampleAnalysisOverview/SampleAnalysisOverview';
import SampleDraftAnalysis from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/SampleDraftAnalysis';
import { ApiClient } from '../../../services/apiClient';
import { SampleAnalysisReview } from './SampleAnalysisReview/SampleAnalysisReview';
import { useSamplesLink } from '../../../hooks/useSamplesLink';

export interface Props {
  sample: Sample;
  apiClient: ApiClient;
}

const SampleAnalysis: FunctionComponent<Props> = ({ sample, apiClient } ) => {
  const { laboratory } = usePartialSample(sample, apiClient);
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
            {![...CompletedStatusList, 'NotAdmissible', 'ToValidate'].includes(
              sample.status
            ) && (
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
      {sample.status !== 'ToValidate' ? (
        <SampleAdmissibility sample={sample} apiClient={apiClient} />
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
          {['Analysis', 'ToValidate', ...CompletedStatusList].includes(
            sample.status
          ) && (
            <div
              className={clsx(
                cx(
                  'fr-callout',
                  [...CompletedStatusList, 'ToValidate'].includes(sample.status)
                    ? 'fr-callout--green-emeraude'
                    : 'fr-callout--pink-tuile'
                ),
                'sample-callout',
                'analysis-container',
                'fr-mt-5w'
              )}
            >
              {sample.status === 'Analysis' && (
                <SampleDraftAnalysis sample={sample} />
              )}
              {CompletedStatusList.includes(sample.status) && (
                <SampleAnalysisOverview sample={sample} />
              )}
              {sample.status === 'ToValidate' && analysis?.reportDocumentId && (
                <SampleAnalysisReview
                  sample={sample}
                  apiClient={apiClient}
                  partialAnalysis={analysis}
                  onReviewDone={() => navigateToSample(sample.id)}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SampleAnalysis;
