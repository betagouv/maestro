import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { groupBy } from 'lodash-es';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { useContext } from 'react';
import { AppPageWithYearTitle } from 'src/components/_app/AppPage/AppPageWithYearTitle';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

import { ProgrammingPlanDomainCreateModal } from './ProgrammingPlanDomainCreateModal';
import { ProgrammingPlanSettingsCard } from './ProgrammingPlanSettingsCard/ProgrammingPlanSettingsCard';

const domainCreateModal = createModal({
  id: 'programming-plan-domain-create-modal',
  isOpenedByDefault: false
});

type Props = Record<never, never>;

export const ProgrammingPlanSettingsView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={(year) => {
        const plansByDomainId = groupBy(
          programmingPlans.filter((plan) => plan.year === year),
          'domainId'
        );
        const yearDomains = domains.filter((domain) => domain.year === year);

        return (
          <div className={clsx('white-container', cx('fr-px-8w', 'fr-py-5w'))}>
            <Breadcrumb
              className={cx('fr-mt-0', 'fr-mb-2w')}
              segments={[]}
              currentPageLabel="Tous les domaines"
            />
            <div
              className={clsx(
                'd-flex-row',
                'd-flex-align-center',
                'd-flex-justify-between',
                cx('fr-pb-5w')
              )}
            >
              <h4 className={clsx(cx('fr-m-0'))}>
                Tous les domaines ({yearDomains.length})
              </h4>
              <Button
                priority="tertiary"
                iconId="fr-icon-file-add-line"
                onClick={domainCreateModal.open}
              >
                Ajouter un domaine
              </Button>
            </div>
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {yearDomains.map((domain) => (
                <div
                  className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}
                  key={domain.id}
                >
                  <ProgrammingPlanSettingsCard
                    title={domain.label}
                    programmingPlans={plansByDomainId[domain.id] ?? []}
                    linkProps={{
                      to: AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
                        domain.id,
                        { year }
                      )
                    }}
                    withPlanCount
                  />
                </div>
              ))}
            </div>
            <ProgrammingPlanDomainCreateModal
              modal={domainCreateModal}
              year={year}
            />
          </div>
        );
      }}
    />
  );
};
