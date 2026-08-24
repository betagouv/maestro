import Alert from '@codegouvfr/react-dsfr/Alert';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { useContext } from 'react';
import { useParams } from 'react-router';
import { AppPageWithYearTitle } from 'src/components/_app/AppPage/AppPageWithYearTitle';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanSettingsActions } from '../ProgrammingPlanSettingsActions/ProgrammingPlanSettingsActions';
import { ProgrammingPlanSettingsBadge } from '../ProgrammingPlanSettingsBadge/ProgrammingPlanSettingsBadge';
import { isCampaignLaunched } from '../ProgrammingPlanSettingsCard/ProgrammingPlanSettingsCard.tsx';

type Props = Record<never, never>;

export const ProgrammingPlanView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { domainId = '', programmingPlanId } = useParams<{
    domainId: string;
    programmingPlanId: string;
  }>();

  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  const domain = domains.find((_) => _.id === domainId);
  const programmingPlan = programmingPlans.find(
    (_) => _.id === programmingPlanId
  );

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={(year) => (
        <div className={clsx('white-container', cx('fr-px-8w', 'fr-py-5w'))}>
          <Breadcrumb
            className={cx('fr-mt-0', 'fr-mb-2w')}
            segments={[
              {
                label: 'Tous les domaines',
                linkProps: {
                  to: AppRouteLinks.ProgrammingPlanSettingsRoute.link({ year })
                }
              },
              {
                label: domain?.label,
                linkProps: {
                  to: AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                    domainId,
                    { year }
                  )
                }
              }
            ]}
            currentPageLabel={programmingPlan?.title}
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
              title="Revenir au domaine"
              linkProps={{
                to: AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                  domainId,
                  { year }
                )
              }}
            />
            <h4 className={clsx(cx('fr-m-0', 'fr-mr-2w'))}>
              {programmingPlan?.title}
            </h4>
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
      )}
    />
  );
};
