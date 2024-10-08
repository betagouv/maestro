import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format } from 'date-fns';
import { DepartmentLabels } from 'shared/referential/Department';
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
import './SampleCard.scss';

interface Props {
  sample: PartialSample | PartialSampleToCreate;
  sampleProgrammingPlan?: ProgrammingPlan;
  userInfos?: UserInfos;
}

const SampleCard = ({ sample, sampleProgrammingPlan }: Props) => {
  const { userInfos, hasPermission } = useAuthentication();
  const { isOnline } = useOnLine();
  return (
    <Card
      start={<SampleStatusBadge status={sample?.status} />}
      title={isCreatedPartialSample(sample) ? sample.reference : 'Hors ligne'}
      border
      linkProps={{
        to: `/prelevements/${sample.id}`,
      }}
      desc={
        <div className={cx('fr-text--xs', 'fr-mb-0')}>
          <div className="icon-text">
            <div className={cx('fr-icon-map-pin-2-line', 'fr-icon--sm')}></div>
            <div>
              {sample.company ? (
                sample.company.name
              ) : (
                <>
                  {sample.companyOffline}
                  <div className="missing-data">Information à compléter</div>
                </>
              )}
            </div>
          </div>
          <div className="icon-text">
            <div
              className={cx('fr-icon-calendar-event-line', 'fr-icon--sm')}
            ></div>
            {format(sample.sampledAt, 'dd/MM/yyyy')}
          </div>
          <div className="icon-text">
            <div className={cx('fr-icon-road-map-line', 'fr-icon--sm')}></div>
            {DepartmentLabels[sample.department]} ({sample.department})
          </div>
          {sampleProgrammingPlan && (
            <div className="icon-text">
              <div
                className={cx('fr-icon-microscope-line', 'fr-icon--sm')}
              ></div>
              {ProgrammingPlanKindLabels[sampleProgrammingPlan?.kind]}
            </div>
          )}
          <div className="icon-text">
            <div className={cx('fr-icon-user-line', 'fr-icon--sm')}></div>
            {isCreatedPartialSample(sample)
              ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
              : `${userInfos?.firstName} ${userInfos?.lastName}`}
          </div>
        </div>
      }
      size="small"
      titleAs="h6"
      end={
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
      }
    />
  );
};

export default SampleCard;
