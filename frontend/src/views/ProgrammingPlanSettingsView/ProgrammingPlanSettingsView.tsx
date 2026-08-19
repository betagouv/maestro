import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { useContext } from 'react';
import { AppPageWithYearTitle } from 'src/components/_app/AppPage/AppPageWithYearTitle';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanDomainCreateModal } from './ProgrammingPlanDomainCreateModal';

const domainCreateModal = createModal({
  id: 'programming-plan-domain-create-modal',
  isOpenedByDefault: false
});

type Props = Record<never, never>;

export const ProgrammingPlanSettingsView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={() => (
        <div className={clsx('white-container', cx('fr-px-8w', 'fr-py-5w'))}>
          <div
            className={clsx(
              'd-flex-row',
              'd-flex-align-center',
              'd-flex-justify-between',
              cx('fr-pb-5w')
            )}
          >
            <h4 className={clsx(cx('fr-m-0'))}>
              Tous les domaines ({domains.length})
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
            {domains.map((domain) => (
              <div
                className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}
                key={domain.id}
              >
                <Card title={domain.label} titleAs="h6" />
              </div>
            ))}
          </div>
          <ProgrammingPlanDomainCreateModal modal={domainCreateModal} />
        </div>
      )}
    />
  );
};
