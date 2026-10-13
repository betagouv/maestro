import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanCreateInput } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
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
  domainId: ProgrammingPlanDomainId;
  onCreated: (created: { id: string }) => void;
};

export const ProgrammingPlanCreateModal = ({
  modal,
  domainId,
  onCreated,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createProgrammingPlan, createProgrammingPlanResult] =
    apiClient.useCreateProgrammingPlanMutation();

  const [title, setTitle] = useState('');

  const form = useForm(ProgrammingPlanCreateInput, { domainId, title });

  useIsModalOpen(modal, {
    onDisclose: () => focusFirstInputWhenVisible(modal),
    onConceal: () => {
      form.reset();
      createProgrammingPlanResult.reset();
      setTitle('');
    }
  });

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await form.validate(async (valid) => {
      try {
        const created = await createProgrammingPlan(valid).unwrap();
        modal.close();
        onCreated(created);
      } catch (_err) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title="Ajouter un plan"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Ajouter',
          onClick: submit,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <form onSubmit={submit}>
        <AppTextInput
          label="Nom du plan"
          value={title}
          inputForm={form}
          inputKey="title"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <AppServiceErrorAlert call={createProgrammingPlanResult} />
      </form>
    </modal.Component>
  );
};
