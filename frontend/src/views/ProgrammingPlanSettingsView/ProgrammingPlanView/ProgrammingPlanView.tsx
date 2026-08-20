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

type Props = Record<never, never>;

export const ProgrammingPlanView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { domainId = '', programmingPlanId } = useParams<{
    domainId: string;
    programmingPlanId: string;
  }>();

  const apiClient = useContext(ApiClientContext);
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  const programmingPlan = programmingPlans.find(
    (_) => _.id === programmingPlanId
  );

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={(year) => (
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
        </div>
      )}
    />
  );
};
