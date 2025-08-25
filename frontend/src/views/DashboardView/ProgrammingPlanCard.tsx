import Button from '@codegouvfr/react-dsfr/Button';
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
      contexts: [context],
      includes: ['sampleCounts']
    });

  return (
    <>
      <div
        className={clsx(
          'white-container',
          cx('fr-px-4w', 'fr-pt-3w', 'fr-pb-2w')
        )}
        style={{
          borderBottom: 'none'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h4>{ContextLabels[context]}</h4>
            <h3>
              {sumBy(regionalPrescriptions, 'sampleCount')}{' '}
              {pluralize(sumBy(regionalPrescriptions, 'sampleCount'))(
                'prélèvement'
              )}
              <br />
              {pluralize(sumBy(regionalPrescriptions, 'sampleCount'))(
                'programmé'
              )}
            </h3>
          </div>
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
          <span style={{ width: 110, textAlign: 'center' }}>de l'objectif</span>
        </div>
        <hr className={cx('fr-mt-4w', 'fr-mb-2w')} />
        <div className={clsx('d-flex-justify-center', cx('fr-col-12'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-bar-chart-box-line"
            linkProps={{
              to: `${AuthenticatedAppRoutes.ProgrammationByYearRoute.link(programmingPlan.year)}?context=${context}`
            }}
          >
            {[ContextLabels[context], programmingPlan.year].join(' ')}
          </Button>
        </div>
      </div>

      <div className={clsx('border', cx('fr-p-2w'))}>
        <ProgrammingPlanMap
          programmingPlan={programmingPlan}
          context={context}
          regionalPrescriptions={regionalPrescriptions ?? []}
        />
      </div>
    </>
  );
};

export default ProgrammingPlanCard;
