import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Table } from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { DistributionKindLabels } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { type FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import ProgrammingPlanAdminModal from './ProgrammingPlanAdminModal';

type Props = Record<never, never>;

const modal = createModal({
  id: 'programming-plan-modal',
  isOpenedByDefault: false
});

export const ProgrammingPlanAdmin: FunctionComponent<Props> = ({
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [programmingPlanToUpdate, setProgrammingPlanToUpdate] =
    useState<null | ProgrammingPlanChecked>(null);
  const [alertMessage, setAlertMessage] = useState<null | string>(null);

  const { useFindProgrammingPlansQuery } = useContext(ApiClientContext);

  const { data: programmingPlans } = useFindProgrammingPlansQuery({});

  const onEdit = async (plan: ProgrammingPlanChecked) => {
    setProgrammingPlanToUpdate(plan);
    modal.open();
  };

  return (
    <div className={clsx('bg-white', cx('fr-p-2w'))}>
      {alertMessage && (
        <Alert
          severity="success"
          small
          description={alertMessage}
          closable={true}
          className={cx('fr-mb-3w')}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className={cx('fr-mb-2w')}>
        <h3>Gestion des plans de programmation</h3>

        <Button
          onClick={() => modal.open()}
          iconId="fr-icon-add-line"
          iconPosition="right"
        >
          Créer un nouveau plan
        </Button>
        <ProgrammingPlanAdminModal
          modal={modal}
          programmingPlanToUpdate={programmingPlanToUpdate}
          setAlertMessage={setAlertMessage}
        />
      </div>

      {programmingPlans && programmingPlans.length > 0 ? (
        <Table
          headers={[
            'Année',
            'Domaine',
            'Titre',
            'Contextes',
            'Cadres juridiques',
            'Substances',
            'Répartition',
            'Hors prog.',
            'Sous-plans',
            ''
          ]}
          data={[...programmingPlans]
            .sort((a, b) => b.year - a.year)
            .map((plan) => [
              plan.year.toString(),
              ProgrammingPlanDomainLabels[plan.domain],
              <>
                <div>{plan.title}</div>
                <Badge
                  severity={plan.closedAt ? 'error' : 'success'}
                  small
                  noIcon
                >
                  {plan.closedAt ? 'Fermé' : 'En cours'}
                </Badge>
              </>,
              plan.contexts.map((_) => (
                <div key={`${plan.id}-context-${_}`}>{ContextLabels[_]}</div>
              )),
              plan.legalContexts.map((_) => (
                <div key={`${plan.id}-legal-context-${_}`}>
                  {LegalContextLabels[_]}
                </div>
              )),
              plan.substanceKinds.map((_) => (
                <div key={`${plan.id}-substance-kind-${_}`}>
                  {SubstanceKindLabels[_]}
                </div>
              )),
              DistributionKindLabels[plan.distributionKind],
              plan.samplesOutsidePlanAllowed ? 'Oui' : 'Non',
              plan.kinds.map((_) => (
                <div key={`${plan.id}-kind-${_}`}>
                  {ProgrammingPlanKindLabels[_]}
                </div>
              )),
              <div
                className={clsx('border-left', 'align-right')}
                key={`actions-${plan.id}`}
              >
                <Button
                  priority="tertiary"
                  size="small"
                  onClick={() => onEdit(plan)}
                >
                  Modifier
                </Button>
              </div>
            ])}
        />
      ) : (
        <p>Aucun plan de programmation trouvé.</p>
      )}
    </div>
  );
};
