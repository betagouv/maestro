import Alert from '@codegouvfr/react-dsfr/Alert';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { YearTitle } from 'src/components/YearTitle/YearTitle';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanSettingsActions } from '../ProgrammingPlanSettingsActions/ProgrammingPlanSettingsActions';
import { ProgrammingPlanSettingsBadge } from '../ProgrammingPlanSettingsBadge/ProgrammingPlanSettingsBadge';
import { isCampaignLaunched } from '../ProgrammingPlanSettingsCard/ProgrammingPlanSettingsCard.tsx';
import { ProgrammingPlanSettingsTabs } from '../ProgrammingPlanSettingsTabs/ProgrammingPlanSettingsTabs';
import { ProgrammingSubPlanList } from '../ProgrammingSubPlanList/ProgrammingSubPlanList';

type Props = Record<never, never>;

export const ProgrammingPlanView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { programmingPlanId = '', subPlanId } = useParams<{
    programmingPlanId: string;
    subPlanId: string;
  }>();
  const navigate = useNavigate();

  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  const programmingPlan = programmingPlans.find(
    (_) => _.id === programmingPlanId
  );
  const domain = domains.find((_) => _.id === programmingPlan?.domainId);
  const subPlan = programmingPlan?.subPlans.find((_) => _.id === subPlanId);

  const title = subPlan
    ? `${subPlan.subPlanNumber} - ${subPlan.label}`
    : programmingPlan?.title;

  const { user, account } = useAuthentication();
  const [planTitle, setPlanTitle] = useState(programmingPlan?.title ?? '');

  useEffect(
    () => setPlanTitle(programmingPlan?.title ?? ''),
    [programmingPlan?.title]
  );

  const canRenamePlan =
    !subPlan &&
    !!programmingPlan &&
    !!user &&
    !!account &&
    canUpdateProgrammingPlanSettings(programmingPlan, user, account.roles);

  return !programmingPlan ? null : (
    <AppPage
      title={
        <YearTitle
          title="Paramétrage des plans"
          year={domain?.year}
          years={domain ? [domain.year] : []}
        />
      }
      documentTitle="Paramétrage des plans"
    >
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-lg-9', 'fr-pr-0')}>
          <div className={clsx('white-container', cx('fr-px-8w', 'fr-py-5w'))}>
            <Breadcrumb
              className={cx('fr-mt-0', 'fr-mb-2w')}
              segments={[
                {
                  label: 'Tous les domaines',
                  linkProps: {
                    to: AppRouteLinks.ProgrammingPlanSettingsRoute.link({
                      year: domain?.year
                    })
                  }
                },
                {
                  label: domain?.label,
                  linkProps: {
                    to: AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                      domain?.id ?? ''
                    )
                  }
                },
                ...(subPlan
                  ? [
                      {
                        label: programmingPlan?.title,
                        linkProps: {
                          to: AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
                            programmingPlanId
                          )
                        }
                      }
                    ]
                  : [])
              ]}
              currentPageLabel={title}
            />
            <div
              className={clsx(
                'd-flex-row',
                'd-flex-align-center',
                cx('fr-pb-5w')
              )}
            >
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-arrow-left-line"
                title={subPlan ? 'Revenir au plan' : 'Revenir au domaine'}
                linkProps={{
                  to: subPlan
                    ? AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
                        programmingPlanId
                      )
                    : AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                        domain?.id ?? ''
                      )
                }}
              />
              {canRenamePlan ? (
                <Input
                  label="Nom du plan"
                  hideLabel
                  className={clsx('flex-grow-1', cx('fr-mb-0', 'fr-mr-2w'))}
                  classes={{ nativeInputOrTextArea: cx('fr-mt-0') }}
                  nativeInputProps={{
                    value: planTitle,
                    'aria-label': 'Nom du plan',
                    onChange: (event) => setPlanTitle(event.currentTarget.value)
                  }}
                />
              ) : (
                <h4 className={clsx(cx('fr-m-0', 'fr-mr-2w'))}>{title}</h4>
              )}
              <ProgrammingPlanSettingsBadge
                programmingPlans={programmingPlan ? [programmingPlan] : []}
              />
              <ProgrammingPlanSettingsActions
                className={cx('fr-ml-auto', 'fr-pl-2w')}
                target={
                  subPlan
                    ? { kind: 'subPlan', programmingPlan, subPlan }
                    : { kind: 'plan', programmingPlan }
                }
                onDeleted={() =>
                  navigate(
                    subPlan
                      ? AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
                          programmingPlanId
                        )
                      : AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                          domain?.id ?? ''
                        )
                  )
                }
                onDuplicated={({ id }) =>
                  navigate(
                    subPlan
                      ? AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
                          programmingPlanId,
                          id
                        )
                      : AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(id)
                  )
                }
              />
            </div>
            {isCampaignLaunched(programmingPlan) && (
              <Alert
                severity={'error'}
                small
                description={
                  'La campagne est lancée pour ce plan. Seuls certains paramètres sont modifiables.'
                }
              />
            )}
            {!subPlan && (
              <Alert
                severity={'info'}
                small
                description={
                  'Les paramètres du plan renseignés ci-dessous seront automatiquement attribués à tous ses sous-plans. Si besoin, vous pourrez ensuite modifier les sous-plans individuellement.'
                }
              />
            )}
            <ProgrammingPlanSettingsTabs
              key={subPlan?.id ?? programmingPlan.id}
              programmingPlan={programmingPlan}
              subPlan={subPlan}
              titleDraft={canRenamePlan ? planTitle : undefined}
              onResetTitle={() => setPlanTitle(programmingPlan.title ?? '')}
            />
          </div>
        </div>
        <div className={cx('fr-col-12', 'fr-col-lg-3', 'fr-pl-0')}>
          <ProgrammingSubPlanList
            subPlans={programmingPlan?.subPlans ?? []}
            programmingPlanId={programmingPlanId}
            currentSubPlanId={subPlan?.id}
          />
        </div>
      </div>
    </AppPage>
  );
};
