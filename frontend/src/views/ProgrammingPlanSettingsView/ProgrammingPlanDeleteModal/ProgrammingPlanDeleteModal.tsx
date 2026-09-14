import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import type React from 'react';
import { useContext } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from 'src/services/apiClient';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';

export type ProgrammingPlanDeletionTarget =
  | {
      kind: 'domain';
      domain: ProgrammingPlanDomain;
      programmingPlans: ProgrammingPlanChecked[];
    }
  | { kind: 'plan'; programmingPlan: ProgrammingPlanChecked }
  | {
      kind: 'subPlan';
      programmingPlan: ProgrammingPlanChecked;
      subPlan: ProgrammingSubPlan;
    };

const withDeletionLabels = (target: ProgrammingPlanDeletionTarget) => {
  switch (target.kind) {
    case 'domain':
      return { ...target, article: 'le domaine', name: target.domain.label };
    case 'plan':
      return {
        ...target,
        article: 'le plan',
        name: target.programmingPlan.title
      };
    case 'subPlan':
      return {
        ...target,
        article: 'le sous-plan',
        name: `${target.subPlan.subPlanNumber} - ${target.subPlan.label}`
      };
    default:
      return assertUnreachable(target);
  }
};

type Props = {
  modal: ReturnType<typeof createModal>;
  target: ProgrammingPlanDeletionTarget;
  onDeleted: () => void;
};

export const ProgrammingPlanDeleteModal = ({
  modal,
  target: unlabelledTarget,
  onDeleted,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const target = withDeletionLabels(unlabelledTarget);

  const apiClient = useContext(ApiClientContext);
  const [deleteProgrammingPlanDomain, deleteDomainCall] =
    apiClient.useDeleteProgrammingPlanDomainMutation();
  const [deleteProgrammingPlan, deletePlanCall] =
    apiClient.useDeleteProgrammingPlanMutation();
  const [deleteProgrammingSubPlan, deleteSubPlanCall] =
    apiClient.useDeleteProgrammingSubPlanMutation();

  const call =
    target.kind === 'domain'
      ? deleteDomainCall
      : target.kind === 'plan'
        ? deletePlanCall
        : deleteSubPlanCall;

  useIsModalOpen(modal, {
    onConceal: () => {
      deleteDomainCall.reset();
      deletePlanCall.reset();
      deleteSubPlanCall.reset();
    }
  });

  const cascadedPlanCount =
    target.kind === 'domain' ? target.programmingPlans.length : 0;
  const cascadedSubPlanCount =
    target.kind === 'domain'
      ? target.programmingPlans.reduce(
          (count, plan) => count + plan.subPlans.length,
          0
        )
      : target.kind === 'plan'
        ? target.programmingPlan.subPlans.length
        : 0;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    try {
      switch (target.kind) {
        case 'domain':
          await deleteProgrammingPlanDomain({
            programmingPlanDomainId: target.domain.id
          }).unwrap();
          break;
        case 'plan':
          await deleteProgrammingPlan({
            programmingPlanId: target.programmingPlan.id
          }).unwrap();
          break;
        case 'subPlan':
          await deleteProgrammingSubPlan({
            programmingPlanId: target.programmingPlan.id,
            programmingSubPlanId: target.subPlan.id
          }).unwrap();
          break;
      }
      modal.close();
      onDeleted();
    } catch (_err) {
      /* empty */
    }
  };

  return (
    <modal.Component
      title={`Supprimer ${target.article}`}
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Supprimer',
          onClick: submit,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <p>
        Vous êtes sur le point de supprimer {target.article}{' '}
        <b>{target.name}</b>. Cette action est irréversible.
      </p>
      {cascadedPlanCount + cascadedSubPlanCount > 0 && (
        <Alert
          severity="warning"
          small
          className={cx('fr-mb-2w')}
          description={`La suppression entraîne aussi celle de ${[
            ...(cascadedPlanCount > 0
              ? [pluralize(cascadedPlanCount, { preserveCount: true })('plan')]
              : []),
            ...(cascadedSubPlanCount > 0
              ? [
                  pluralize(cascadedSubPlanCount, { preserveCount: true })(
                    'sous-plan'
                  )
                ]
              : [])
          ].join(' et ')} et de leur paramétrage.`}
        />
      )}
      <AppServiceErrorAlert call={call} />
    </modal.Component>
  );
};
