import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { ProgrammingPlanDomainCreateInput } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type React from 'react';
import { useContext, useState } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

type Props = {
  modal: ReturnType<typeof createModal>;
  year: number;
};

export const ProgrammingPlanDomainCreateModal = ({
  modal,
  year,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createProgrammingPlanDomain, createProgrammingPlanDomainResult] =
    apiClient.useCreateProgrammingPlanDomainMutation();

  const [label, setLabel] = useState('');

  const form = useForm(ProgrammingPlanDomainCreateInput, { label, year });

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      createProgrammingPlanDomainResult.reset();
      setLabel('');
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (valid) => {
      try {
        await createProgrammingPlanDomain(valid).unwrap();
        modal.close();
      } catch (_err) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title="Ajouter un domaine"
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
      <form>
        <AppTextInput
          label="Libellé du domaine"
          value={label}
          inputForm={form}
          inputKey="label"
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <AppServiceErrorAlert call={createProgrammingPlanDomainResult} />
      </form>
    </modal.Component>
  );
};
