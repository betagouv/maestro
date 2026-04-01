import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  type AdminFieldConfig,
  CreatePlanKindFieldInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import type React from 'react';
import { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

type FormData = {
  fieldId: string;
  required: boolean;
};

interface Props {
  modal: ReturnType<typeof createModal>;
  programmingPlanId: string;
  kind: ProgrammingPlanKind;
  allFields: AdminFieldConfig[];
  activeFields: PlanKindFieldConfig[];
}

export const AddFieldToKindModal = ({
  modal,
  programmingPlanId,
  kind,
  allFields,
  activeFields,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [addPlanKindField, addPlanKindFieldResult] =
    apiClient.useAddPlanKindFieldMutation();

  const nextOrder = activeFields.length + 1;
  const [formData, setFormData] = useState<FormData>({
    fieldId: '',
    required: false
  });

  const form = useForm(CreatePlanKindFieldInput, {
    fieldId: formData.fieldId,
    required: formData.required,
    order: nextOrder
  });

  const activeFieldKeys = activeFields.map((f) => f.field.key);
  const availableFields = allFields.filter(
    (f) => !activeFieldKeys.includes(f.key)
  );

  const fieldOptions = [
    { value: '', label: '-- Sélectionner un champ --', hidden: true },
    ...availableFields.map((f) => ({
      value: f.id,
      label: `${f.key} — ${f.label}`
    }))
  ];

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      addPlanKindFieldResult.reset();
      setTimeout(
        () =>
          setFormData({
            fieldId: '',
            required: false
          }),
        2
      );
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (valid) => {
      try {
        await addPlanKindField({
          programmingPlanId,
          kind,
          body: valid
        }).unwrap();
        e.preventDefault();
        modal.close();
      } catch (_e) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title="Ajouter un champ"
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
        <AppSelect
          label="Champ"
          value={formData.fieldId}
          inputForm={form}
          inputKey="fieldId"
          options={fieldOptions}
          onChange={(e) =>
            setFormData((d) => ({ ...d, fieldId: e.target.value }))
          }
          required
        />
        <ToggleSwitch
          label="Obligatoire"
          checked={formData.required}
          onChange={(checked) =>
            setFormData((d) => ({ ...d, required: checked }))
          }
          showCheckedHint={false}
        />
        <AppServiceErrorAlert call={addPlanKindFieldResult} />
      </form>
    </modal.Component>
  );
};
