import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import type {
  AdminFieldConfig,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { SpecificDataFieldId } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { refineSchema } from 'maestro-shared/utils/zod';
import type React from 'react';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { useForm } from '../../../hooks/useForm';

const AddFieldForm = z.object({
  fieldId: refineSchema(
    SpecificDataFieldId,
    (value) => value.length > 0,
    'Veuillez sélectionner un champ'
  ),
  required: z.boolean()
});

type FormData = z.infer<typeof AddFieldForm>;

const emptyFormData: FormData = {
  fieldId: '' as SpecificDataFieldId,
  required: false
};

interface Props {
  modal: ReturnType<typeof createModal>;
  availableFields: AdminFieldConfig[];
  onAdd: (field: ProgrammingSubPlanFieldSetting) => void;
}

export const AddFieldToProgrammingSubPlanModal = ({
  modal,
  availableFields,
  onAdd,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const form = useForm(AddFieldForm, formData);

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
      setTimeout(() => setFormData(emptyFormData), 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async ({ fieldId, required }) => {
      onAdd({
        fieldId,
        required,
        optionIds: [],
        inheritance: 'Own',
        managedAtPlanLevel: false
      });
      e.preventDefault();
      modal.close();
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
            setFormData((d) => ({
              ...d,
              fieldId: e.target.value as SpecificDataFieldId
            }))
          }
          required
        />
        <ToggleSwitch
          label="Obligatoire"
          checked={formData.required}
          onChange={(required) => setFormData((d) => ({ ...d, required }))}
          showCheckedHint={false}
        />
      </form>
    </modal.Component>
  );
};
