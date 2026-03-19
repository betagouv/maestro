import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldOptionInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import React, { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

type FormData = {
  value: string;
  label: string;
  order: string;
};

const defaultFormData = (nextOrder: number): FormData => ({
  value: '',
  label: '',
  order: String(nextOrder)
});

interface Props {
  field: AdminFieldConfig;
  optionToEdit: AdminFieldOption | null;
  modal: ReturnType<typeof createModal>;
}

export const FieldOptionFormModal = ({
  field,
  optionToEdit,
  modal,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createFieldOption, createFieldOptionResult] =
    apiClient.useCreateFieldOptionMutation();
  const [updateFieldOption, updateFieldOptionResult] =
    apiClient.useUpdateFieldOptionMutation();

  const nextOrder = Math.max(0, ...field.options.map((o) => o.order)) + 1;

  const [formData, setFormData] = useState<FormData>(
    defaultFormData(nextOrder)
  );

  const form = useForm(CreateFieldOptionInput, {
    value: formData.value,
    label: formData.label,
    order: Number(formData.order)
  });

  useEffect(() => {
    if (optionToEdit) {
      setFormData({
        value: optionToEdit.value,
        label: optionToEdit.label,
        order: String(optionToEdit.order)
      });
    } else {
      setFormData(defaultFormData(nextOrder));
    }
  }, [optionToEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      createFieldOptionResult.reset();
      updateFieldOptionResult.reset();
      setTimeout(() => setFormData(defaultFormData(nextOrder)), 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (valid) => {
      try {
        if (optionToEdit) {
          await updateFieldOption({
            fieldId: field.id,
            optionId: optionToEdit.id,
            body: { label: valid.label, order: valid.order }
          }).unwrap();
        } else {
          await createFieldOption({ fieldId: field.id, body: valid }).unwrap();
        }
        e.preventDefault();
        modal.close();
      } catch (_err) {
        /* empty */
      }
    });
  };

  return (
    <modal.Component
      title={optionToEdit ? "Modifier l'option" : 'Nouvelle option'}
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Enregistrer',
          onClick: submit,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <form>
        <AppTextInput
          label="Valeur"
          value={formData.value}
          inputForm={form}
          inputKey="value"
          disabled={!!optionToEdit}
          onChange={(e) =>
            setFormData((d) => ({ ...d, value: e.target.value }))
          }
          required
        />
        <AppTextInput
          label="Libellé"
          value={formData.label}
          inputForm={form}
          inputKey="label"
          onChange={(e) =>
            setFormData((d) => ({ ...d, label: e.target.value }))
          }
          required
        />
        <AppTextInput
          label="Ordre"
          value={formData.order}
          inputForm={form}
          inputKey="order"
          type="number"
          min={1}
          onChange={(e) =>
            setFormData((d) => ({ ...d, order: e.target.value }))
          }
          required
        />
        <AppServiceErrorAlert call={createFieldOptionResult} />
        <AppServiceErrorAlert call={updateFieldOptionResult} />
      </form>
    </modal.Component>
  );
};
