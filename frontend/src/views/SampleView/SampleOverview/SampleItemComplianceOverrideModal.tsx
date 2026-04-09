import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type React from 'react';
import { type FunctionComponent, useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import z from 'zod';
import check from '../../../assets/illustrations/check.svg';
import close from '../../../assets/illustrations/close.svg';
import AppRadioButtons from '../../../components/_app/AppRadioButtons/AppRadioButtons';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

const FormSchema = z.object({
  complianceOverride: z.boolean({
    error: () => 'Veuillez renseigner la conformité.'
  })
});

type Props = {
  sampleItem: SampleItem;
  modal: ReturnType<typeof createModal>;
};

export const SampleItemComplianceOverrideModal: FunctionComponent<Props> = ({
  sampleItem,
  modal,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateSampleItem] = apiClient.useUpdateSampleItemMutation();

  const [complianceOverride, setComplianceOverride] = useState(
    sampleItem.complianceOverride
  );

  const form = useForm(FormSchema, { complianceOverride });

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    await form.validate(async (values) => {
      await updateSampleItem({
        updateKey: 'analysis',
        ...sampleItem,
        complianceOverride: values.complianceOverride
      });
    });
  };

  return (
    <modal.Component
      title="Modifier la conformité"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          onClick: () => ({}),
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Enregistrer',
          onClick: save,
          doClosesModal: true,
          priority: 'primary'
        }
      ]}
    >
      <AppRadioButtons
        legend="Conformité de l'échantillon"
        options={[
          {
            label: 'Conforme',
            nativeInputProps: {
              checked: complianceOverride === true,
              onChange: () => setComplianceOverride(true)
            },
            illustration: <img src={check} alt="" aria-hidden />
          },
          {
            label: 'Non conforme',
            nativeInputProps: {
              checked: complianceOverride === false,
              onChange: () => setComplianceOverride(false)
            },
            illustration: <img src={close} alt="" aria-hidden />
          }
        ]}
        colSm={6}
        inputForm={form}
        inputKey="complianceOverride"
        whenValid="Conformité correctement renseignée"
        required
      />
    </modal.Component>
  );
};
