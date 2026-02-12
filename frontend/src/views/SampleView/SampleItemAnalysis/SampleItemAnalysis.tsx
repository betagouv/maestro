import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useContext, useMemo } from 'react';
import { usePartialSample } from 'src/hooks/usePartialSample';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleAnalysisForm } from './SampleItemAnalysisForm/SampleAnalysisForm';
import { SampleAnalysisOverview } from './SampleItemAnalysisOverview/SampleAnalysisOverview';

import Accordion from '@codegouvfr/react-dsfr/Accordion';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { useLocation } from 'react-router';
import { SampleItemAdmissibility } from './SampleItemAdmissibility/SampleItemAdmissibility';
import { SampleItemAdmissibilityForm } from './SampleItemAdmissibility/SampleItemAdmissibilityForm';
import './SampleItemAnalysis.scss';
import { AnalysisDocumentPreview } from './SampleItemAnalysisForm/AnalysisDocumentPreview';

type Props = {
  sample: SampleChecked;
  sampleItem: SampleItem;
};

const SampleItemAnalysis: FunctionComponent<Props> = ({
  sample,
  sampleItem
}) => {
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
    itemNumber: sampleItem.itemNumber,
    copyNumber: sampleItem.copyNumber
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
        {/*<div className="sample-status">*/}
        {/*  <SampleStatusBadge status={sample.status} sampleId={sample.id} />*/}
        {/*</div>*/}
        {['Analysis', 'InReview', 'Completed', 'NotAdmissible'].includes(
          sample.status
        ) && (
          <SampleItemAdmissibility
            sample={sample}
            readonly={readonly}
            sampleItem={sampleItem}
          />
        )}

        {isEditing && sample.status === 'Sent' && (
          <SampleItemAdmissibilityForm
            sample={sample}
            withSubmitButton={true}
          />
        )}

        {sample.status !== 'NotAdmissible' && (
          <AnalysisDocumentPreview
            partialAnalysis={analysis}
            sampleId={sample.id}
            readonly={!isEditing}
          />
        )}
      </div>

      <div className="border">
        <Accordion label="Détails de l'échantillon" defaultExpanded>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Quantité prélevée</div>
              <div className={cx('fr-text--bold')}>
                {sampleItem.quantity} {sampleItem.quantityUnit}
              </div>
            </div>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Numéro de scellé</div>
              <div className={cx('fr-text--bold')}>{sampleItem.sealId}</div>
            </div>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Directive 2002/63</div>
              <div className={cx('fr-text--bold')}>
                {!sampleItem.compliance200263 && 'non '}respectée
              </div>
            </div>
          </div>
        </Accordion>
        {/*<Accordion label="Facturation"></Accordion>*/}
      </div>

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

export default SampleItemAnalysis;
