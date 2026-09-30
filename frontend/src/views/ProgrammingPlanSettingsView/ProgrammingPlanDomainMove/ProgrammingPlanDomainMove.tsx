import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Select from '@codegouvfr/react-dsfr/Select';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type React from 'react';
import { useContext, useState } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

const modal = createModal({
  id: 'programming-plan-domain-move-modal',
  isOpenedByDefault: false
});

type Props = {
  programmingPlan: ProgrammingPlanChecked;
};

export const ProgrammingPlanDomainMove = ({
  programmingPlan,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasAccountPermission } = useAuthentication();
  const apiClient = useContext(ApiClientContext);
  const { data: domains = [] } = apiClient.useFindProgrammingPlanDomainsQuery();
  const [updateProgrammingPlanDomain, updateCall] =
    apiClient.useUpdateProgrammingPlanDomainMutation();

  const [domainId, setDomainId] = useState<ProgrammingPlanDomainId>();
  const [movedToLabel, setMovedToLabel] = useState<string>();

  useIsModalOpen(modal, {
    onConceal: () => {
      setDomainId(undefined);
      updateCall.reset();
    }
  });

  if (!hasAccountPermission('administrationMaestro')) {
    return null;
  }

  const targetDomains = domains.filter(
    (domain) =>
      domain.year === programmingPlan.year &&
      domain.id !== programmingPlan.domainId
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const targetDomain = targetDomains.find((_) => _.id === domainId);
    if (!targetDomain) {
      return;
    }
    await updateProgrammingPlanDomain({
      programmingPlanId: programmingPlan.id,
      domainId: targetDomain.id
    }).unwrap();
    modal.close();
    setMovedToLabel(targetDomain.label);
  };

  return (
    <>
      <Button priority="tertiary" onClick={modal.open}>
        Changer de domaine
      </Button>
      <modal.Component
        title="Changer de domaine"
        concealingBackdrop={false}
        topAnchor
        buttons={[
          {
            children: 'Annuler',
            doClosesModal: true,
            priority: 'secondary'
          },
          {
            children: 'Déplacer',
            doClosesModal: false,
            disabled: !domainId || updateCall.isLoading,
            onClick: submit
          }
        ]}
      >
        <Select
          label={`Nouveau domaine du plan ${programmingPlan.title}`}
          nativeSelectProps={{
            value: domainId ?? '',
            onChange: (e) =>
              setDomainId(
                (e.target.value || undefined) as
                  | ProgrammingPlanDomainId
                  | undefined
              )
          }}
        >
          <option value="" disabled>
            Sélectionner un domaine
          </option>
          {targetDomains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.label}
            </option>
          ))}
        </Select>
        <AppServiceErrorAlert call={updateCall} />
      </modal.Component>
      <AppToast
        open={movedToLabel !== undefined}
        description={`Le plan ${programmingPlan.title} a été déplacé dans le domaine ${movedToLabel}.`}
        onClose={() => setMovedToLabel(undefined)}
      />
    </>
  );
};
