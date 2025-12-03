import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { SampleStatusBadge } from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import SampleAdmissibility from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleAnalysisForm } from './SampleAnalysisForm/SampleAnalysisForm';
import { SampleAnalysisOverview } from './SampleAnalysisOverview/SampleAnalysisOverview';

import { useLocation } from 'react-router';
import './SampleAnalysis.scss';
import { AnalysisReportStep } from './SampleDraftAnalysis/AnalysisReportStep/AnalysisReportStep';

type Props = {
  sample: Sample;
};

const SampleAnalysis: FunctionComponent<Props> = ({ sample }) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const location = useLocation();

  const { getSampleItemLaboratory } = usePartialSample(sample);
  const { navigateToSample, navigateToSampleEdit } = useSamplesLink();
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

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  const isEditing: boolean =
    !readonly &&
    (location.pathname.endsWith('/edit') || analysis?.status !== 'Completed');

  return (
    <div>
      {isSendingSuccess && sample.status !== 'InReview' && (
        <Alert
          severity="info"
          small
          description={
            <>
              Votre demande d’analyse a bien été transmise par email{' '}
              <ul>
                {sample.items
                  .filter((item) => item.copyNumber === 1)
                  .map((item) => (
                    <li key={item.itemNumber}>
                      {getLaboratoryFullName(
                        getSampleItemLaboratory(item.itemNumber)
                      )}
                    </li>
                  ))}
              </ul>
            </>
          }
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

      <AnalysisReportStep partialAnalysis={analysis} sampleId={sample.id} />

      {['Analysis', 'InReview', 'Completed'].includes(sample.status) &&
        analysis && (
          <div className={clsx('analysis-container', 'fr-mt-4w')}>
            {!isEditing ? (
              <SampleAnalysisOverview
                sample={sample}
                analysis={analysis}
                readonly={readonly}
                onEdit={() => navigateToSampleEdit(sample.id)}
              />
            ) : (
              <SampleAnalysisForm
                partialAnalysis={analysis}
                sample={sample}
                onDone={() => navigateToSample(sample.id)}
              />
            )}
          </div>
        )}
      {sample.status === 'InReview' && <UserFeedback />}
    </div>
  );
};

export default SampleAnalysis;
