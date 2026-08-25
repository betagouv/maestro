import Alert from '@codegouvfr/react-dsfr/Alert';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { useContext } from 'react';
import { useParams } from 'react-router';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { YearTitle } from 'src/components/YearTitle/YearTitle';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanSettingsActions } from '../ProgrammingPlanSettingsActions/ProgrammingPlanSettingsActions';
import { ProgrammingPlanSettingsBadge } from '../ProgrammingPlanSettingsBadge/ProgrammingPlanSettingsBadge';
import { isCampaignLaunched } from '../ProgrammingPlanSettingsCard/ProgrammingPlanSettingsCard.tsx';
import { ProgrammingSubPlanList } from '../ProgrammingSubPlanList/ProgrammingSubPlanList';

type Props = Record<never, never>;

export const ProgrammingPlanView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { programmingPlanId = '', subPlanId } = useParams<{
    programmingPlanId: string;
    subPlanId: string;
  }>();

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

  return (
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
              <h4 className={clsx(cx('fr-m-0', 'fr-mr-2w'))}>{title}</h4>
              <ProgrammingPlanSettingsBadge
                programmingPlans={programmingPlan ? [programmingPlan] : []}
              />
              <ProgrammingPlanSettingsActions className={cx('fr-ml-auto')} />
            </div>
            {!!programmingPlan && isCampaignLaunched(programmingPlan) && (
              <Alert
                severity={'error'}
                small
                description={
                  'La campagne est lancée pour ce plan. Seuls certains paramètres sont modifiables.'
                }
              />
            )}
            <Alert
              severity={'info'}
              small
              description={
                'Les paramètres du plan renseignés ci-dessous seront automatiquement attribués à tous ses sous-plans. Si besoin, vous pourrez ensuite modifier les sous-plans individuellement.'
              }
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
