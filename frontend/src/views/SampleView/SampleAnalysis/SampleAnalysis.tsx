import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { getLaboratoryFullname } from 'maestro-shared/referential/Laboratory';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { FunctionComponent, useContext, useState } from 'react';
import { SampleStatusBadge } from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import SampleAdmissibility from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import SampleAnalysisOverview from 'src/views/SampleView/SampleAnalysis/SampleAnalysisOverview/SampleAnalysisOverview';
import SampleDraftAnalysis from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/SampleDraftAnalysis';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleAnalysisReview } from './SampleAnalysisReview/SampleAnalysisReview';

type Props = {
  sample: Sample;
};

const SampleAnalysis: FunctionComponent<Props> = ({ sample }) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();

  const { laboratory } = usePartialSample(sample);
  const { navigateToSample } = useSamplesLink();
  const [updateSample, { isSuccess: isSendingSuccess }] =
    apiClient.useUpdateSampleMutation({
      fixedCacheKey: `sending-sample-${sample.id}`
    });
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    apiClient.useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`
    });
  const { data: analysis } = apiClient.useGetSampleAnalysisQuery(sample.id);

  const setAnalysisToReview = () => {
    updateSample({ ...sample, status: 'InReview' });
  };

  const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long'
  });
  const [receivedAt] = useState(
    sample.receivedAt ? dateFormat.format(sample.receivedAt) : undefined
  );

  const [continueToAnalysis, setContinueToAnalysis] = useState(false);

  return (
    <div>
      {isSendingSuccess && laboratory && sample.status !== 'InReview' && (
        <Alert
          severity="info"
          small
          description={`Votre demande d’analyse a bien été transmise au laboratoire ${getLaboratoryFullname(laboratory.name)} par e-mail.`}
          className={cx('fr-mb-4w')}
        />
      )}
      {sample.status === 'Completed' && isCompletingAnalysisSuccess && (
        <Alert
          severity="info"
          small
          description="Les résultats d’analyse ont bien été enregistrés."
          className={cx('fr-mb-4w')}
        />
      )}
      <div className="section-header">
        <div style={{ flex: 1 }}>
          <h3>
            <div className="sample-status">
              <div>Suivi du prélèvement</div>
              <div>
                {sample.status === 'Completed' &&
                  hasUserPermission('restoreSampleToReview') && (
                    <Button
                      iconId="fr-icon-arrow-go-back-fill"
                      iconPosition="left"
                      priority="secondary"
                      className="fr-mr-1w"
                      onClick={setAnalysisToReview}
                    >
                      {SampleStatusLabels['InReview']}
                    </Button>
                  )}
                <SampleStatusBadge
                  status={sample.status}
                  sampleId={sample.id}
                />
              </div>
            </div>
            {!['Completed', 'NotAdmissible'].includes(sample.status) && (
              <>
                {sample.status !== 'InReview' ? (
                  <div
                    className={cx(
                      'fr-text--lg',
                      'fr-text--regular',
                      'fr-mb-1w'
                    )}
                  >
                    Renseignez ci-dessous le suivi d’analyse par le laboratoire
                  </div>
                ) : (
                  <div className={clsx(cx('fr-mb-1w'), 'd-flex-align-center')}>
                    <span
                      className={cx(
                        'fr-icon-success-fill',
                        'fr-label--success',
                        'fr-mr-1w'
                      )}
                    />
                    <span
                      className={cx(
                        'fr-text--lg',
                        'fr-text--regular',
                        'fr-mb-0'
                      )}
                    >
                      Échantillon recevable et reçu par le laboratoire le{' '}
                      {receivedAt}
                    </span>
                  </div>
                )}
              </>
            )}
          </h3>
        </div>
      </div>
      {sample.status !== 'InReview' ? (
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
          {['Analysis', 'InReview', 'Completed'].includes(sample.status) && (
            <div
              className={clsx(
                cx(
                  'fr-callout',
                  ['Completed', 'InReview'].includes(sample.status)
                    ? 'fr-callout--green-emeraude'
                    : 'fr-callout--pink-tuile'
                ),
                'sample-callout',
                'analysis-container',
                'fr-mt-5w'
              )}
            >
              {sample.status === 'InReview' && analysis !== undefined ? (
                <SampleAnalysisReview
                  sample={sample}
                  partialAnalysis={analysis}
                  onReviewDone={() => navigateToSample(sample.id)}
                />
              ) : (
                <SampleDraftAnalysis sample={sample} />
              )}
              {sample.status === 'Completed' && (
                <SampleAnalysisOverview sample={sample} />
              )}
            </div>
          )}
          {sample.status === 'InReview' && <UserFeedback />}
        </>
      )}
    </div>
  );
};

export default SampleAnalysis;
