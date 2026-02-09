import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useContext, useMemo } from 'react';
import { SampleStatusBadge } from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { SampleAdmissibility } from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleAnalysisForm } from './SampleAnalysisForm/SampleAnalysisForm';
import { SampleAnalysisOverview } from './SampleAnalysisOverview/SampleAnalysisOverview';

import { useLocation } from 'react-router';
import { SampleAdmissibilityForm } from './SampleAdmissibility/SampleAdmissibilityForm';
import './SampleAnalysis.scss';
import { AnalysisDocumentPreview } from './SampleAnalysisForm/AnalysisDocumentPreview';

type Props = {
  sample: SampleChecked;
};

const SampleAnalysis: FunctionComponent<Props> = ({ sample }) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const location = useLocation();

  const { getSampleItemLaboratory } = usePartialSample(sample);
  const { navigateToSample, navigateToSampleEdit } = useSamplesLink();
  const [_updateSample, { isSuccess: isSendingSuccess }] =
    apiClient.useUpdateSampleMutation({
      fixedCacheKey: `sending-sample-${sample.id}`
    });
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    apiClient.useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`
    });
  const { data: analysis } = apiClient.useGetSampleItemAnalysisQuery({
    sampleId: sample.id,
    itemNumber: 1, //TODO à gérer
    copyNumber: 1 //TODO à gérer
  });

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  const isEditing: boolean =
    !readonly &&
    (location.pathname.endsWith('/edit') || analysis?.status !== 'Completed');

  return (
    <div className={'analysis-container'}>
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

      <div>
        <div className="sample-status">
          <h3 className={cx('fr-m-0')}>Suivi des résultats</h3>
          <SampleStatusBadge status={sample.status} sampleId={sample.id} />
        </div>
        {['Analysis', 'InReview', 'Completed', 'NotAdmissible'].includes(
          sample.status
        ) && <SampleAdmissibility sample={sample} readonly={readonly} />}
      </div>

      {isEditing && sample.status === 'Sent' && (
        <SampleAdmissibilityForm sample={sample} withSubmitButton={true} />
      )}

      {sample.status !== 'NotAdmissible' && (
        <AnalysisDocumentPreview
          partialAnalysis={analysis}
          sampleId={sample.id}
          readonly={!isEditing}
        />
      )}

      {['Analysis', 'InReview', 'Completed'].includes(sample.status) &&
        analysis && (
          <>
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
          </>
        )}
      {sample.status === 'InReview' && <UserFeedback />}
    </div>
  );
};

export default SampleAnalysis;
