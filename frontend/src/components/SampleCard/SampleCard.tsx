import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useState } from 'react';
import { DepartmentLabels } from 'shared/referential/Department';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
} from 'shared/schema/Sample/Sample';
import { DraftStatusList } from 'shared/schema/Sample/SampleStatus';
import { UserInfos } from 'shared/schema/User/User';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import RemoveSample from 'src/components/SampleTable/RemoveSample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useOnLine } from 'src/hooks/useOnLine';
import useWindowSize from 'src/hooks/useWindowSize';
import './SampleCard.scss';

interface Props {
  sample: PartialSample | PartialSampleToCreate;
  sampleProgrammingPlan?: ProgrammingPlan;
  userInfos?: UserInfos;
}

const SampleCard = ({ sample, sampleProgrammingPlan }: Props) => {
  const { userInfos, hasPermission } = useAuthentication();
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
        to: `/prelevements/${sample.id}`,
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
                  <div className="missing-data">Information à compléter</div>
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
                {format(sample.sampledAt, 'dd/MM/yyyy')}
              </span>
              <span className="icon-text">
                <span
                  className={cx('fr-icon-road-map-line', 'fr-icon--sm')}
                ></span>
                {DepartmentLabels[sample.department]} ({sample.department})
              </span>
              {sampleProgrammingPlan && (
                <span className="icon-text">
                  <span
                    className={cx('fr-icon-microscope-line', 'fr-icon--sm')}
                  ></span>
                  {ProgrammingPlanKindLabels[sampleProgrammingPlan?.kind]}
                </span>
              )}
              {sample.matrix && (
                <span className="icon-text">
                  <span
                    className={cx('fr-icon-restaurant-line', 'fr-icon--sm')}
                  ></span>
                  {MatrixLabels[sample.matrix]}
                </span>
              )}
              <span className="icon-text">
                <span className={cx('fr-icon-user-line', 'fr-icon--sm')}></span>
                {isCreatedPartialSample(sample)
                  ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
                  : `${userInfos?.firstName} ${userInfos?.lastName}`}
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
                to: `/prelevements/${sample.id}`,
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
              hasPermission('deleteSample') &&
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
