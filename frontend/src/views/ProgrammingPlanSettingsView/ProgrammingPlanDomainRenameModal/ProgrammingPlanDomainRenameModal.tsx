import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import {
  type ProgrammingPlanDomain,
  ProgrammingPlanDomainUpdateInput
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type React from 'react';
import { useContext, useState } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { focusFirstInputWhenVisible } from 'src/utils/modalUtils';
import { assert, type Equals } from 'tsafe';

type Props = {
  modal: ReturnType<typeof createModal>;
  domain: ProgrammingPlanDomain;
};

export const ProgrammingPlanDomainRenameModal = ({
  modal,
  domain,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateProgrammingPlanDomain, updateProgrammingPlanDomainResult] =
    apiClient.useUpdateProgrammingPlanDomainMutation();

  const [label, setLabel] = useState(domain.label);

  const form = useForm(ProgrammingPlanDomainUpdateInput, { label });

  useIsModalOpen(modal, {
    onDisclose: () => {
      setLabel(domain.label);
      focusFirstInputWhenVisible(modal);
    },
    onConceal: () => {
      form.reset();
      updateProgrammingPlanDomainResult.reset();
    }
  });

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await form.validate(async (valid) => {
      try {
        await updateProgrammingPlanDomain({
          programmingPlanDomainId: domain.id,
          ...valid
        }).unwrap();
        modal.close();
      } catch (_err) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title="Renommer le domaine"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Renommer',
          onClick: submit,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <form onSubmit={submit}>
        <AppTextInput
          label="Libellé du domaine"
          value={label}
          inputForm={form}
          inputKey="label"
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <AppServiceErrorAlert call={updateProgrammingPlanDomainResult} />
      </form>
    </modal.Component>
  );
};
