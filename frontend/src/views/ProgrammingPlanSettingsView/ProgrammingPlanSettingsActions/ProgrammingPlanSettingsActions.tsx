import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import {
  isProgrammingPlanDeletable,
  isProgrammingPlanDomainDeletable
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isProgrammingSubPlanDeletable } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { UserBase } from 'maestro-shared/schema/User/User';
import type { UserRole } from 'maestro-shared/schema/User/UserRole';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { assert, type Equals } from 'tsafe';

import {
  ProgrammingPlanDeleteModal,
  type ProgrammingPlanDeletionTarget
} from '../ProgrammingPlanDeleteModal/ProgrammingPlanDeleteModal';
import './ProgrammingPlanSettingsActions.scss';

const canDelete = (
  target: ProgrammingPlanDeletionTarget,
  user: Pick<UserBase, 'id'> | undefined,
  userRoles: UserRole[] | undefined
): boolean => {
  if (!user || !userRoles) {
    return false;
  }

  const plans =
    target.kind === 'domain'
      ? target.programmingPlans
      : [target.programmingPlan];

  return plans.every((plan) =>
    canUpdateProgrammingPlanSettings(plan, user, userRoles)
  );
};

const deletionForbiddenReason = (
  target: ProgrammingPlanDeletionTarget
): string | undefined => {
  switch (target.kind) {
    case 'domain':
      return isProgrammingPlanDomainDeletable(target.programmingPlans)
        ? undefined
        : 'Ce domaine contient un plan ou un sous-plan dont le paramétrage est terminé.';
    case 'plan':
      return isProgrammingPlanDeletable(target.programmingPlan)
        ? undefined
        : 'Le paramétrage de ce plan ou de l’un de ses sous-plans est terminé.';
    case 'subPlan':
      return isProgrammingSubPlanDeletable(target.subPlan)
        ? undefined
        : 'Le paramétrage de ce sous-plan est terminé.';
    default:
      return assertUnreachable(target);
  }
};

const deleteModal = createModal({
  id: 'programming-plan-delete-modal',
  isOpenedByDefault: false
});

type Props = {
  target: ProgrammingPlanDeletionTarget;
  onDeleted: () => void;
  className?: string;
};

export const ProgrammingPlanSettingsActions = ({
  target,
  onDeleted,
  className,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { user, account } = useAuthentication();

  const forbiddenReason = deletionForbiddenReason(target);

  //FIXME DOMAIN implémenter la duplication

  return (
    <span className={clsx('programming-plan-settings-actions', className)}>
      <Button
        title="Dupliquer"
        iconId="ri-file-copy-line"
        priority="tertiary"
        onClick={() => ({})}
      />
      {canDelete(target, user, account?.roles) && (
        <>
          <Button
            title={forbiddenReason ?? 'Supprimer'}
            iconId="fr-icon-delete-bin-line"
            priority="tertiary"
            disabled={!!forbiddenReason}
            onClick={deleteModal.open}
          />
          <ProgrammingPlanDeleteModal
            modal={deleteModal}
            target={target}
            onDeleted={onDeleted}
          />
        </>
      )}
    </span>
  );
};
