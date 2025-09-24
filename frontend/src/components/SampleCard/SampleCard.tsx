import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format } from 'date-fns';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  getSampleMatrixLabel,
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { User } from 'maestro-shared/schema/User/User';
import { useState } from 'react';
import { SampleStatusBadge } from 'src/components/SampleStatusBadge/SampleStatusBadge';
import RemoveSample from 'src/components/SampleTable/RemoveSample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useOnLine } from 'src/hooks/useOnLine';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import useWindowSize from 'src/hooks/useWindowSize';
import './SampleCard.scss';

type Props = {
  sample: PartialSample | PartialSampleToCreate;
  horizontal?: boolean;
};

const SampleCard = ({ sample, horizontal }: Props) => {
  const { sampleLink } = useSamplesLink();
  const { user, hasUserPermission } = useAuthentication();
  const { isOnline } = useOnLine();
  const { isMobile } = useWindowSize();

  const [isExpanded, setIsExpanded] = useState(!isMobile);

  return (
    <Card
      {...(horizontal ? { enlargeLink: true } : { enlargeLink: false })}
      className="sample-card"
      start={
        !horizontal && (
          <div className={clsx('d-flex-align-start')}>
            <div className="flex-grow-1">
              <SampleStatusBadge status={sample.status} sampleId={sample.id} />
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
        )
      }
      title={
        isCreatedPartialSample(sample) ? (
          <div className={clsx('d-flex-align-center')}>
            <div className="flex-grow-1">{sample.reference}</div>
            {horizontal && (
              <SampleStatusBadge status={sample.status} sampleId={sample.id} />
            )}{' '}
          </div>
        ) : (
          'Hors ligne'
        )
      }
      classes={
        horizontal
          ? {
              start: cx('fr-hidden'),
              link: 'flex-grow-1',
              content: cx('fr-p-2w', 'fr-pb-5v'),
              desc: cx('fr-mt-0')
            }
          : {}
      }
      border
      linkProps={{
        to: sampleLink(sample.id)
      }}
      desc={
        <span className={cx('fr-text--xs', 'fr-mb-0')}>
          {horizontal ? (
            <>
              <span className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <span className={cx('fr-col-6')}>
                  <CompanyBlock sample={sample} />
                </span>
                <span className={cx('fr-col-6')}>
                  <ContextBlock sample={sample} />
                </span>
              </span>
              <span className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <span className={cx('fr-col-6')}>
                  <SamplerBlock sample={sample} user={user} />
                </span>
                <span className={cx('fr-col-6')}>
                  <MatrixBlock sample={sample} />
                </span>
              </span>
            </>
          ) : (
            <>
              <CompanyBlock sample={sample} />
              {isExpanded && (
                <>
                  <DateBlock sample={sample} />
                  <DepartmentBlock sample={sample} />
                  <ContextBlock sample={sample} />
                  <MatrixBlock sample={sample} />
                  <SamplerBlock sample={sample} user={user} />
                </>
              )}
            </>
          )}
        </span>
      }
      size="small"
      titleAs="h6"
      end={
        isExpanded &&
        !horizontal && (
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

const CompanyBlock = ({
  sample
}: {
  sample: PartialSample | PartialSampleToCreate;
}) => {
  return (
    <span className="icon-text">
      <span className={cx('fr-icon-map-pin-2-line', 'fr-icon--sm')}></span>
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
  );
};

const DateBlock = ({
  sample
}: {
  sample: PartialSample | PartialSampleToCreate;
}) => {
  return (
    <span className="icon-text">
      <span className={cx('fr-icon-calendar-event-line', 'fr-icon--sm')}></span>
      {sample.sampledAt ? (
        format(sample.sampledAt, 'dd/MM/yyyy')
      ) : (
        <span className="missing-data">Information à compléter</span>
      )}
    </span>
  );
};

const DepartmentBlock = ({
  sample
}: {
  sample: PartialSample | PartialSampleToCreate;
}) => {
  return (
    <span className="icon-text">
      <span className={cx('fr-icon-road-map-line', 'fr-icon--sm')}></span>
      {sample.department ? (
        <>
          {DepartmentLabels[sample.department]} ({sample.department})
        </>
      ) : (
        <span className="missing-data">Information à compléter</span>
      )}
    </span>
  );
};

const ContextBlock = ({
  sample
}: {
  sample: PartialSample | PartialSampleToCreate;
}) => {
  return (
    <span className="icon-text">
      <span className={cx('fr-icon-microscope-line', 'fr-icon--sm')}></span>
      {sample.context ? (
        ContextLabels[sample.context]
      ) : (
        <span className="missing-data">Information à compléter</span>
      )}
    </span>
  );
};

const MatrixBlock = ({
  sample
}: {
  sample: PartialSample | PartialSampleToCreate;
}) => {
  let matrixFullLabel: null | string = null;
  if (sample.matrixKind) {
    matrixFullLabel = MatrixKindLabels[sample.matrixKind];
    const matrixLabel = getSampleMatrixLabel(sample);
    if (matrixLabel !== '' && matrixLabel !== matrixFullLabel) {
      matrixFullLabel += ` - ${matrixLabel}`;
    }
  }

  return matrixFullLabel ? (
    <span className="icon-text">
      <span className={cx('fr-icon-restaurant-line', 'fr-icon--sm')}></span>
      {matrixFullLabel}
    </span>
  ) : (
    <></>
  );
};

const SamplerBlock = ({
  sample,
  user
}: {
  sample: PartialSample | PartialSampleToCreate;
  user?: User;
}) => {
  return (
    <span className="icon-text">
      <span className={cx('fr-icon-user-line', 'fr-icon--sm')}></span>
      {isCreatedPartialSample(sample)
        ? `${sample.sampler.name}`
        : `${user?.name}`}
    </span>
  );
};

export default SampleCard;
