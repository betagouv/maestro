import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import {
  ContextLabels,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { getCompletionRate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useContext } from 'react';
import { Link } from 'react-router';
import { pluralize } from 'src/utils/stringUtils';
import ProgrammingPlanMap from 'src/views/DashboardView/ProgrammingPlanMap';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { CircleProgress } from '../../components/CircleProgress/CircleProgress';
import { ApiClientContext } from '../../services/apiClient';

interface ProgrammingPlanCardProps {
  programmingPlan: ProgrammingPlan;
  context: ProgrammingPlanContext;
}

const ProgrammingPlanCard = ({
  programmingPlan,
  context
}: ProgrammingPlanCardProps) => {
  const apiClient = useContext(ApiClientContext);

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery({
      programmingPlanId: programmingPlan.id,
      context,
      includes: ['realizedSampleCount']
    });

  return (
    <Card
      background
      border
      shadow
      size="medium"
      title={[ContextLabels[context], programmingPlan.year].join(' ')}
      titleAs="h2"
      end={
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-pt-0')}>
            {/*FIXME on vire tout ça ?*/}
            {/*{programmingPlan.regionalStatus.some(*/}
            {/*  (_) => _.status === 'Validated'*/}
            {/*) ? (*/}
            {/*  <Badge severity="success" noIcon>*/}
            {/*    Taux de réalisation :{' '}*/}
            {/*{getCompletionRate(*/}
            {/*  regionalPrescriptions ?? []*/}
            {/*)}%*/}
            {/*  </Badge>*/}
            {/*) : (*/}
            {/*  <Badge severity="warning" noIcon>*/}
            {/*    {ProgrammingPlanStatusLabels['InProgress']}*/}
            {/*  </Badge>*/}
            {/*)}*/}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span
                className={cx('fr-text--bold')}
                style={{ fontSize: '1.5rem' }}
              >
                {sumBy(regionalPrescriptions, 'sampleCount')}{' '}
                {pluralize(sumBy(regionalPrescriptions, 'sampleCount'))(
                  'prélèvement programmé'
                )}
              </span>
              <CircleProgress
                progress={getCompletionRate(regionalPrescriptions ?? [])}
                sizePx={110}
                type={'percentage'}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>
                {sumBy(regionalPrescriptions, 'realizedSampleCount')}{' '}
                {pluralize(sumBy(regionalPrescriptions, 'realizedSampleCount'))(
                  'prélèvement réalisé'
                )}
              </span>
              <span style={{ width: 110, textAlign: 'center' }}>
                de l'objectif
              </span>
            </div>
          </div>
          <div className="border-middle" />
          <div className={clsx('d-flex-justify-center', cx('fr-col-12'))}>
            <Link
              to={`${AuthenticatedAppRoutes.ProgrammationByYearRoute.link(programmingPlan.year)}?context=${context}`}
              className={cx('fr-link', 'fr-link--sm')}
            >
              {[ContextLabels[context], programmingPlan.year].join(' ')}
            </Link>
          </div>

          <div className={cx('fr-col-12')}>
            <ProgrammingPlanMap
              regionalPrescriptions={regionalPrescriptions ?? []}
            />
          </div>
        </div>
      }
    ></Card>
  );
};

export default ProgrammingPlanCard;
