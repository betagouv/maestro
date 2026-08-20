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
import { ProgrammingPlanSettingsCard } from '../ProgrammingPlanSettingsCard/ProgrammingPlanSettingsCard';

type Props = Record<never, never>;

export const ProgrammingPlanDomainView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { domainId = '' } = useParams<{ domainId: string }>();

  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  const domain = domains.find((_) => _.id === domainId);

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={(year) => {
        const domainPlans = programmingPlans.filter(
          (plan) => plan.domainId === domainId && plan.year === year
        );

        return (
          <div className={clsx('white-container', cx('fr-px-8w', 'fr-py-5w'))}>
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
                title="Revenir à tous les domaines"
                linkProps={{
                  to: AppRouteLinks.ProgrammingPlanSettingsRoute.link({ year })
                }}
              />
              <h4 className={clsx(cx('fr-m-0', 'fr-mr-2w'))}>
                {domain?.label} ({domainPlans.length})
              </h4>
              <ProgrammingPlanSettingsBadge programmingPlans={domainPlans} />
              <ProgrammingPlanSettingsActions className={cx('fr-ml-auto')} />
              <Button
                priority="tertiary"
                iconId="fr-icon-file-add-line"
                className={cx('fr-ml-1w')}
                onClick={() => ({
                  //FIXME DOMAIN implémenter l'action
                })}
              >
                Ajouter un plan
              </Button>
            </div>
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {domainPlans.map((plan) => (
                <div
                  className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}
                  key={plan.id}
                >
                  <ProgrammingPlanSettingsCard
                    title={plan.title}
                    programmingPlans={[plan]}
                    linkProps={{
                      to: AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
                        domainId,
                        plan.id,
                        { year }
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
};
