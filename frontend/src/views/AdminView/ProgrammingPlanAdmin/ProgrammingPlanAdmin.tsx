import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Table } from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { DistributionKindLabels } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { type FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import ProgrammingPlanAdminModal from './ProgrammingPlanAdminModal';

type Props = Record<never, never>;

export const ProgrammingPlanAdmin: FunctionComponent<Props> = ({
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [alertMessage, setAlertMessage] = useState<null | string>(null);

  const { useFindProgrammingPlansQuery } = useContext(ApiClientContext);

  const { data: programmingPlans } = useFindProgrammingPlansQuery({});

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
        <ProgrammingPlanAdminModal setAlertMessage={setAlertMessage} />
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
            'Sous-plans'
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
              ))
            ])}
        />
      ) : (
        <p>Aucun plan de programmation trouvé.</p>
      )}
    </div>
  );
};
