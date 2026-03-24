import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { ProgrammingPlanKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useEffect, useState } from 'react';
import dashboard from 'src/assets/illustrations/dashboard.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useOnLine } from 'src/hooks/useOnLine';
import ProgrammingPlanCard from 'src/views/DashboardView/ProgrammingPlanCard';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { ApiClientContext } from '../../services/apiClient';
import DashboardNoticeAndActions from './DashboardNoticeAndActions';
import DashboardPrescriptions from './DashboardPrescriptions';

const DashboardView = () => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user, hasNationalView, hasRole } =
    useAuthentication();
  const { isOnline } = useOnLine();

  const { data: validatedProgrammingPlans } =
    apiClient.useFindProgrammingPlansQuery(
      {
        kinds: hasRole('Administrator')
          ? ProgrammingPlanKindList
          : user?.programmingPlanKinds,
        status: ['Validated']
      },
      {
        skip: !user?.programmingPlanKinds.length && !hasRole('Administrator')
      }
    );

  const [currentValidatedProgrammingPlan, setCurrentValidatedProgrammingPlan] =
    useState<ProgrammingPlanChecked>();

  useEffect(() => {
    setCurrentValidatedProgrammingPlan(
      [...(validatedProgrammingPlans ?? [])]
        .sort(ProgrammingPlanSort)
        .filter((pp) => pp.year <= new Date().getFullYear())[0]
    );
  }, [validatedProgrammingPlans]);

  if (!user) {
    return <></>;
  }

  return (
    <AppPage
      title="Tableau de bord"
      subtitle="Un rapide coup d'oeil sur votre activité"
      illustration={dashboard}
      documentTitle="Tableau de bord"
      action={
        <>
          {(validatedProgrammingPlans?.length ?? 0) > 1 && (
            <Select
              label=""
              nativeSelectProps={{
                value: currentValidatedProgrammingPlan?.id ?? '',
                onChange: (e) =>
                  setCurrentValidatedProgrammingPlan(
                    validatedProgrammingPlans?.find(
                      (plan) => plan.id === e.target.value
                    )
                  )
              }}
              className={clsx(cx('fr-pt-4w'))}
            >
              {validatedProgrammingPlans?.map((plan) => (
                <option key={`plan-${plan.id}`} value={plan.id}>
                  {plan.title} {plan.year}
                </option>
              ))}
            </Select>
          )}
          {currentValidatedProgrammingPlan &&
            hasUserPermission('createSample') && (
              <Button
                size="large"
                linkProps={{
                  to: AuthenticatedAppRoutes.NewSampleRoute.link(
                    currentValidatedProgrammingPlan.year
                  ),
                  target: '_self'
                }}
                iconId="fr-icon-microscope-line"
              >
                Saisir un prélèvement
              </Button>
            )}
        </>
      }
    >
      {isOnline && (
        <>
          <DashboardNoticeAndActions
            currentValidatedProgrammingPlan={currentValidatedProgrammingPlan}
          />
          <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>
            {hasNationalView &&
              currentValidatedProgrammingPlan?.contexts.map((context) => (
                <div
                  className={cx('fr-col-12', 'fr-col-md-6')}
                  key={`${currentValidatedProgrammingPlan.id}-${context}`}
                >
                  <ProgrammingPlanCard
                    programmingPlan={currentValidatedProgrammingPlan}
                    context={context}
                  />
                </div>
              ))}

            {currentValidatedProgrammingPlan && (
              <DashboardPrescriptions
                programmingPlan={currentValidatedProgrammingPlan}
                className={clsx(cx('fr-col-12'))}
              />
            )}
          </div>
        </>
      )}
    </AppPage>
  );
};

export default DashboardView;
