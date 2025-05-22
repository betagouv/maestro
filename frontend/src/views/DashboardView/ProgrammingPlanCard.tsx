import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { sumBy } from 'lodash-es';
import {
  Context,
  ContextLabels
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { getCompletionRate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RealizedStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindRegionalPrescriptionsQuery } from 'src/services/regionalPrescription.service';
import { useCountSamplesQuery } from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import ProgrammingPlanMap from 'src/views/DashboardView/ProgrammingPlanMap';
import { AuthenticatedAppRoutes } from '../../AppRoutes';

interface ProgrammingPlanCardProps {
  programmingPlan: ProgrammingPlan;
  context: Context;
}

const ProgrammingPlanCard = ({
  programmingPlan,
  context
}: ProgrammingPlanCardProps) => {
  const { hasNationalView } = useAuthentication();

  const { data: regionalPrescriptions } = useFindRegionalPrescriptionsQuery({
    programmingPlanId: programmingPlan.id,
    context,
    includes: ['realizedSampleCount']
  });

  const { data: samplesToSentCount } = useCountSamplesQuery(
    {
      programmingPlanId: programmingPlan.id,
      context,
      status: 'Submitted'
    },
    { skip: hasNationalView }
  );

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
            {programmingPlan.regionalStatus.some(
              (_) => _.status === 'Validated'
            ) ? (
              <Badge severity="success" noIcon>
                Taux de réalisation :{' '}
                {getCompletionRate(regionalPrescriptions ?? [])}%
              </Badge>
            ) : (
              <Badge severity="warning" noIcon>
                {ProgrammingPlanStatusLabels['InProgress']}
              </Badge>
            )}
          </div>
          <div className={cx('fr-col-12', 'fr-col-md-6')}>
            <Card
              background
              border
              size="small"
              title={sumBy(regionalPrescriptions, 'sampleCount')}
              desc={pluralize(sumBy(regionalPrescriptions, 'sampleCount'))(
                'prélèvement programmé'
              )}
              className={'fr-card--xs'}
            />
          </div>
          {programmingPlan.regionalStatus.some(
            (_) => _.status === 'Validated'
          ) && (
            <div className={cx('fr-col-12', 'fr-col-md-6')}>
              <Card
                background
                border
                size="small"
                title={sumBy(regionalPrescriptions, 'realizedSampleCount')}
                desc={pluralize(
                  sumBy(regionalPrescriptions, 'realizedSampleCount')
                )('prélèvement réalisé')}
                className={'fr-card--xs'}
                enlargeLink
                linkProps={{
                  to: `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?status=${RealizedStatusList}&programmingPlanId=${programmingPlan.id}&context=${context}`
                }}
              />
            </div>
          )}
          {hasNationalView && (
            <div className={cx('fr-col-12')}>
              <ProgrammingPlanMap
                regionalPrescriptions={regionalPrescriptions ?? []}
              />
            </div>
          )}
          {!hasNationalView && (samplesToSentCount ?? 0) > 0 && (
            <div className={cx('fr-col-12', 'fr-col-md-6')}>
              <Card
                background
                border
                size="small"
                title={samplesToSentCount}
                desc={`${pluralize(samplesToSentCount ?? 0)(
                  'prélèvement'
                )}  à envoyer`}
                className={'fr-card--xs'}
                enlargeLink
                linkProps={{
                  to: `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?status=Submitted&programmingPlanId=${programmingPlan.id}`
                }}
              />
            </div>
          )}
        </div>
      }
      footer={
        <Button
          className={cx('fr-mr-2w')}
          linkProps={{
            to: `${AuthenticatedAppRoutes.ProgrammationByYearRoute.link(programmingPlan.year)}?context=${context}`
          }}
          priority="secondary"
          iconId="fr-icon-table-2"
        >
          {ContextLabels[context]}
        </Button>
      }
    ></Card>
  );
};

export default ProgrammingPlanCard;
