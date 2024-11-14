import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { sumBy } from 'lodash';
import { useMemo } from 'react';
import { RegionList } from 'shared/referential/Region';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { Context, ContextLabels } from 'shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RealizedStatusList } from 'shared/schema/Sample/SampleStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import {
  useCountSamplesQuery,
  useFindSamplesQuery,
} from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import ProgrammingPlanMap from 'src/views/DashboardView/ProgrammingPlanMap';

interface ProgrammingPlanCardProps {
  programmingPlan: ProgrammingPlan;
  context: Context;
}

const ProgrammingPlanCard = ({
  programmingPlan,
  context,
}: ProgrammingPlanCardProps) => {
  const { hasNationalView, userInfos } = useAuthentication();

  const { data: prescriptions } = useFindPrescriptionsQuery({
    programmingPlanId: programmingPlan.id,
    context,
  });
  const { data: samples } = useFindSamplesQuery({
    programmingPlanId: programmingPlan.id,
    context,
    status: RealizedStatusList,
  });
  const { data: samplesToSentCount } = useCountSamplesQuery(
    {
      programmingPlanId: programmingPlan.id,
      context,
      status: 'Submitted',
    },
    { skip: hasNationalView }
  );

  const planCompletionRate = useMemo(() => {
    if (prescriptions && samples) {
      return matrixCompletionRate(
        genPrescriptionByMatrix(
          prescriptions,
          samples,
          userInfos?.region ? [userInfos.region] : RegionList
        )
      );
    }
  }, [prescriptions, samples, userInfos]); // eslint-disable-line react-hooks/exhaustive-deps

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
            {programmingPlan.status === 'InProgress' && (
              <Badge severity="new" noIcon>
                ProgrammingPlanStatusLabels[programmingPlan.status]
              </Badge>
            )}
            {programmingPlan.status === 'Submitted' && (
              <Badge severity="warning" noIcon>
                ProgrammingPlanStatusLabels[programmingPlan.status]
              </Badge>
            )}
            {programmingPlan.status === 'Validated' && (
              <Badge severity="success" noIcon>
                Taux de réalisation : {planCompletionRate}%
              </Badge>
            )}
          </div>
          <div className={cx('fr-col-12', 'fr-col-md-6')}>
            <Card
              background
              border
              size="small"
              title={sumBy(prescriptions, 'sampleCount')}
              desc={pluralize(sumBy(prescriptions, 'sampleCount'))(
                'prélèvement programmé'
              )}
              className={'fr-card--xs'}
            />
          </div>
          {programmingPlan.status === 'Validated' && (
            <div className={cx('fr-col-12', 'fr-col-md-6')}>
              <Card
                background
                border
                size="small"
                title={samples?.length ?? 0}
                desc={pluralize(samples?.length ?? 0)('prélèvement réalisé')}
                className={'fr-card--xs'}
                enlargeLink
                linkProps={{
                  to: `/prelevements/${programmingPlan.year}?status=${RealizedStatusList}&programmingPlanId=${programmingPlan.id}&context=${context}`,
                }}
              />
            </div>
          )}
          {hasNationalView && (
            <div className={cx('fr-col-12')}>
              <ProgrammingPlanMap
                programmingPlan={programmingPlan}
                prescriptions={prescriptions ?? []}
                samples={samples ?? []}
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
                  to: `/prelevements/${programmingPlan.year}?status=Submitted&programmingPlanId=${programmingPlan.id}`,
                }}
              />
            </div>
          )}
        </div>
      }
      footer={
        <div style={{ textAlign: 'center' }}>
          <Button
            className={cx('fr-mr-2w')}
            linkProps={{
              to: `/prescriptions/${programmingPlan.year}?context=${context}`,
            }}
          >
            Voir le tableau complet
          </Button>
        </div>
      }
    ></Card>
  );
};

export default ProgrammingPlanCard;
