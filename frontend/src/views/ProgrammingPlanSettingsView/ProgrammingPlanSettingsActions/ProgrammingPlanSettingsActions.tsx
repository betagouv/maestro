import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { MatrixReferential } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import { isProgrammingPlanDeletable } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { subPlanLabel } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { UserBase } from 'maestro-shared/schema/User/User';
import type { UserRole } from 'maestro-shared/schema/User/UserRole';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { useState } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { assert, type Equals } from 'tsafe';

import {
  ProgrammingPlanDeleteModal,
  type ProgrammingPlanDeletionTarget
} from '../ProgrammingPlanDeleteModal/ProgrammingPlanDeleteModal';
import { ProgrammingPlanDomainRenameModal } from '../ProgrammingPlanDomainRenameModal/ProgrammingPlanDomainRenameModal';
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

const duplicationLabel = (
  matrixReferential: MatrixReferential,
  target: ProgrammingPlanDeletionTarget
): string => {
  switch (target.kind) {
    case 'domain':
      return `Le domaine ${target.domain.label}`;
    case 'plan':
      return `Le plan ${target.programmingPlan.title}`;
    case 'subPlan':
      return `Le sous-plan ${target.subPlan.subPlanNumber} - ${subPlanLabel(matrixReferential, target.subPlan)}`;
    default:
      return assertUnreachable(target);
  }
};

const deletionForbiddenReason = (
  target: ProgrammingPlanDeletionTarget,
  userRoles: UserRole[]
): string | undefined => {
  switch (target.kind) {
    case 'domain':
      return undefined;
    case 'plan':
      return isProgrammingPlanDeletable(target.programmingPlan, userRoles)
        ? undefined
        : 'Ce plan a été soumis aux régions.';
    case 'subPlan':
      return isProgrammingPlanDeletable(target.programmingPlan, userRoles)
        ? undefined
        : 'Le plan de ce sous-plan a été soumis aux régions.';
    default:
      return assertUnreachable(target);
  }
};

const deleteModal = createModal({
  id: 'programming-plan-delete-modal',
  isOpenedByDefault: false
});

const renameDomainModal = createModal({
  id: 'programming-plan-domain-rename-modal',
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

  const { user, account, hasAccountPermission } = useAuthentication();
  const matrixReferential = useMatrixReferential();

  const forbiddenReason = deletionForbiddenReason(target, account?.roles ?? []);
  const canManage = canDelete(target, user, account?.roles);
  const canDeleteTarget =
    canManage &&
    (target.kind !== 'domain' || hasAccountPermission('administrationMaestro'));
  const [duplicatedLabel, setDuplicatedLabel] = useState<string>();

  return (
    <span className={clsx('programming-plan-settings-actions', className)}>
      {canManage && target.kind === 'domain' && (
        <>
          <Button
            title="Renommer"
            iconId="fr-icon-edit-line"
            priority="tertiary"
            onClick={renameDomainModal.open}
          />
          <ProgrammingPlanDomainRenameModal
            modal={renameDomainModal}
            domain={target.domain}
          />
        </>
      )}
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
              setDuplicatedLabel(duplicationLabel(matrixReferential, target));
              onDuplicated(duplicated);
            }}
          />
        </>
      )}
      {canDeleteTarget && (
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
