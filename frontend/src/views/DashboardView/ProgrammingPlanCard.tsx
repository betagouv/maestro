import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { sumBy } from 'lodash';
import { useMemo } from 'react';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import ProgrammingPlanMap from 'src/views/DashboardView/ProgrammingPlanMap';

interface ProgrammingPlanCardProps {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanCard = ({ programmingPlan }: ProgrammingPlanCardProps) => {
  const { hasNationalView } = useAuthentication();

  const { data: prescriptions } = useFindPrescriptionsQuery({
    programmingPlanId: programmingPlan.id,
  });
  const { data: samples } = useFindSamplesQuery({
    programmingPlanId: programmingPlan.id,
    status: 'Sent',
  });
  const { data: samplesToSent } = useFindSamplesQuery(
    {
      programmingPlanId: programmingPlan.id,
      status: 'Submitted',
    },
    { skip: hasNationalView }
  );

  const planCompletionRate = useMemo(() => {
    if (prescriptions && samples) {
      return matrixCompletionRate(
        genPrescriptionByMatrix(prescriptions, samples)
      );
    }
  }, [prescriptions, samples]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card
      background
      border
      shadow
      size="medium"
      title={programmingPlan.title}
      titleAs="h2"
      end={
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-pt-0')}>
            {programmingPlan.status === 'InProgress' ? (
              <Badge severity="new" noIcon>
                Programmation en cours
              </Badge>
            ) : (
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
              desc="prélèvements programmés"
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
                desc="prélèvements réalisés"
                className={'fr-card--xs'}
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
          {!hasNationalView && samplesToSent && samplesToSent.length > 0 && (
            <div className={cx('fr-col-12')}>
              <Alert
                severity="warning"
                small
                description={
                  <>
                    {t('sample', {
                      count: samplesToSent.length,
                    })}
                     en attente d'envoi
                  </>
                }
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
              to: `/plans/${programmingPlan.id}/prescription`,
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
