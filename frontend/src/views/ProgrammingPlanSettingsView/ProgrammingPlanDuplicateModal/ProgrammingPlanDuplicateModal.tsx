import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import type React from 'react';
import { useContext } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

import type { ProgrammingPlanDeletionTarget } from '../ProgrammingPlanDeleteModal/ProgrammingPlanDeleteModal';

const withDuplicationLabels = (target: ProgrammingPlanDeletionTarget) => {
  switch (target.kind) {
    case 'domain':
      return {
        ...target,
        article: 'le domaine',
        name: target.domain.label,
        year: target.domain.year,
        cascade: 'le domaine et les plans et sous-plans liés à ce domaine'
      };
    case 'plan':
      return {
        ...target,
        article: 'le plan',
        name: target.programmingPlan.title,
        year: target.programmingPlan.year,
        cascade: 'le plan et ses sous-plans'
      };
    case 'subPlan':
      return {
        ...target,
        article: 'le sous-plan',
        name: `${target.subPlan.subPlanNumber} - ${target.subPlan.label}`,
        year: target.programmingPlan.year,
        cascade: `le sous-plan ${target.subPlan.label}`
      };
    default:
      return assertUnreachable(target);
  }
};

type Props = {
  modal: ReturnType<typeof createModal>;
  target: ProgrammingPlanDeletionTarget;
  onDuplicated: (duplicated: { id: string }) => void;
};

export const ProgrammingPlanDuplicateModal = ({
  modal,
  target: unlabelledTarget,
  onDuplicated,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const target = withDuplicationLabels(unlabelledTarget);

  const apiClient = useContext(ApiClientContext);
  const [duplicateProgrammingPlanDomain, duplicateDomainCall] =
    apiClient.useDuplicateProgrammingPlanDomainMutation();
  const [duplicateProgrammingPlan, duplicatePlanCall] =
    apiClient.useDuplicateProgrammingPlanMutation();
  const [duplicateProgrammingSubPlan, duplicateSubPlanCall] =
    apiClient.useDuplicateProgrammingSubPlanMutation();

  const call =
    target.kind === 'domain'
      ? duplicateDomainCall
      : target.kind === 'plan'
        ? duplicatePlanCall
        : duplicateSubPlanCall;

  useIsModalOpen(modal, {
    onConceal: () => {
      duplicateDomainCall.reset();
      duplicatePlanCall.reset();
      duplicateSubPlanCall.reset();
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const duplicated =
      target.kind === 'domain'
        ? await duplicateProgrammingPlanDomain({
            programmingPlanDomainId: target.domain.id
          }).unwrap()
        : target.kind === 'plan'
          ? await duplicateProgrammingPlan({
              programmingPlanId: target.programmingPlan.id
            }).unwrap()
          : await duplicateProgrammingSubPlan({
              programmingPlanId: target.programmingPlan.id,
              programmingSubPlanId: target.subPlan.id
            }).unwrap();

    modal.close();
    onDuplicated(duplicated);
  };

  return (
    <modal.Component
      title={`Dupliquer ${target.article}`}
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: `Dupliquer ${target.article}`,
          doClosesModal: false,
          disabled: call.isLoading,
          onClick: submit
        }
      ]}
    >
      <p className={cx('fr-mb-2w')}>
        Êtes-vous sûr(e) de vouloir dupliquer {target.article}{' '}
        <b>{target.name}</b> ?
      </p>
      <p className={cx('fr-mb-0')}>
        Cela aura pour effet de dupliquer {target.cascade} sur la campagne{' '}
        {target.year}.
      </p>
      <AppServiceErrorAlert call={call} />
    </modal.Component>
  );
};
