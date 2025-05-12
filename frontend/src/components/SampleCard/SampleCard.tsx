import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format } from 'date-fns';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { useState } from 'react';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import RemoveSample from 'src/components/SampleTable/RemoveSample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useOnLine } from 'src/hooks/useOnLine';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import useWindowSize from 'src/hooks/useWindowSize';
import './SampleCard.scss';

interface Props {
  sample: PartialSample | PartialSampleToCreate;
}

const SampleCard = ({ sample }: Props) => {
  const { sampleLink } = useSamplesLink();
  const { user, hasUserPermission } = useAuthentication();
  const { isOnline } = useOnLine();
  const { isMobile } = useWindowSize();

  const [isExpanded, setIsExpanded] = useState(!isMobile);

  return (
    <Card
      className="sample-card"
      start={
        <div className={clsx('d-flex-align-start')}>
          <div className="flex-grow-1">
            <SampleStatusBadge status={sample?.status} />
          </div>
          {isMobile && (
            <>
              {isExpanded ? (
                <Button
                  title="Réduire"
                  iconId="fr-icon-subtract-line"
                  size="small"
                  priority="tertiary"
                  onClick={() => setIsExpanded(false)}
                />
              ) : (
                <Button
                  title="Voir plus"
                  iconId="fr-icon-add-line"
                  size="small"
                  priority="tertiary"
                  onClick={() => setIsExpanded(true)}
                />
              )}
            </>
          )}
        </div>
      }
      title={isCreatedPartialSample(sample) ? sample.reference : 'Hors ligne'}
      border
      linkProps={{
        to: sampleLink(sample.id)
      }}
      desc={
        <span className={cx('fr-text--xs', 'fr-mb-0')}>
          <span className="icon-text">
            <span
              className={cx('fr-icon-map-pin-2-line', 'fr-icon--sm')}
            ></span>
            <span>
              {sample.company ? (
                sample.company.name
              ) : (
                <>
                  {sample.companyOffline}
                  <span className="missing-data">Information à compléter</span>
                </>
              )}
            </span>
          </span>
          {isExpanded && (
            <>
              <span className="icon-text">
                <span
                  className={cx('fr-icon-calendar-event-line', 'fr-icon--sm')}
                ></span>
                {sample.sampledAt ? (
                  format(sample.sampledAt, 'dd/MM/yyyy')
                ) : (
                  <span className="missing-data">Information à compléter</span>
                )}
              </span>
              <span className="icon-text">
                <span
                  className={cx('fr-icon-road-map-line', 'fr-icon--sm')}
                ></span>
                {'department' in sample && sample.department ? (
                  <>
                    {DepartmentLabels[sample.department]} ({sample.department})
                  </>
                ) : (
                  <span className="missing-data">Information à compléter</span>
                )}
              </span>
              <span className="icon-text">
                <span
                  className={cx('fr-icon-microscope-line', 'fr-icon--sm')}
                ></span>
                {sample.context ? (
                  ContextLabels[sample.context]
                ) : (
                  <span className="missing-data">Information à compléter</span>
                )}
              </span>
              {sample.matrixKind && (
                <span className="icon-text">
                  <span
                    className={cx('fr-icon-restaurant-line', 'fr-icon--sm')}
                  ></span>
                  {MatrixKindLabels[sample.matrixKind]}
                </span>
              )}
              <span className="icon-text">
                <span className={cx('fr-icon-user-line', 'fr-icon--sm')}></span>
                {isCreatedPartialSample(sample)
                  ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
                  : `${user?.firstName} ${user?.lastName}`}
              </span>
            </>
          )}
        </span>
      }
      size="small"
      titleAs="h6"
      end={
        isExpanded && (
          <div className={clsx('d-flex-align-center')}>
            <Button
              size="small"
              className={clsx('fr-mr-2w')}
              linkProps={{
                to: sampleLink(sample.id)
              }}
              priority={
                [...DraftStatusList, 'Submitted'].includes(sample.status)
                  ? 'primary'
                  : 'secondary'
              }
            >
              {[...DraftStatusList, 'Submitted'].includes(sample.status)
                ? 'A compléter'
                : 'Consulter'}
            </Button>
            {isOnline &&
              hasUserPermission('deleteSample') &&
              DraftStatusList.includes(sample.status) && (
                <RemoveSample sample={sample} />
              )}
          </div>
        )
      }
    />
  );
};

export default SampleCard;
