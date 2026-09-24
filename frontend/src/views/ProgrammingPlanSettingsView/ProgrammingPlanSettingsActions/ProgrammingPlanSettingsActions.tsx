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
import { useState } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { assert, type Equals } from 'tsafe';

import {
  ProgrammingPlanDeleteModal,
  type ProgrammingPlanDeletionTarget
} from '../ProgrammingPlanDeleteModal/ProgrammingPlanDeleteModal';
import { ProgrammingPlanDuplicateModal } from '../ProgrammingPlanDuplicateModal/ProgrammingPlanDuplicateModal';
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

const duplicationLabel = (target: ProgrammingPlanDeletionTarget): string => {
  switch (target.kind) {
    case 'domain':
      return `Le domaine ${target.domain.label}`;
    case 'plan':
      return `Le plan ${target.programmingPlan.title}`;
    case 'subPlan':
      return `Le sous-plan ${target.subPlan.subPlanNumber} - ${target.subPlan.label}`;
    default:
      return assertUnreachable(target);
  }
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

const duplicateModal = createModal({
  id: 'programming-plan-duplicate-modal',
  isOpenedByDefault: false
});

type Props = {
  target: ProgrammingPlanDeletionTarget;
  onDeleted: () => void;
  onDuplicated: (duplicated: { id: string }) => void;
  className?: string;
};

export const ProgrammingPlanSettingsActions = ({
  target,
  onDeleted,
  onDuplicated,
  className,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { user, account } = useAuthentication();

  const forbiddenReason = deletionForbiddenReason(target);
  const canManage = canDelete(target, user, account?.roles);
  const [duplicatedLabel, setDuplicatedLabel] = useState<string>();

  return (
    <span className={clsx('programming-plan-settings-actions', className)}>
      {canManage && (
        <>
          <Button
            title="Dupliquer"
            iconId="ri-file-copy-fill"
            priority="tertiary"
            onClick={duplicateModal.open}
          />
          <ProgrammingPlanDuplicateModal
            modal={duplicateModal}
            target={target}
            onDuplicated={(duplicated) => {
              setDuplicatedLabel(duplicationLabel(target));
              onDuplicated(duplicated);
            }}
          />
        </>
      )}
      {canManage && (
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
      <AppToast
        open={duplicatedLabel !== undefined}
        description={`${duplicatedLabel} a été dupliqué avec succès.`}
        onClose={() => setDuplicatedLabel(undefined)}
      />
    </span>
  );
};
