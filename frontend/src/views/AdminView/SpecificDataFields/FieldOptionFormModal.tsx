import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { CommemoratifValueSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import {
  type AdminFieldConfig,
  type AdminFieldOption,
  CreateFieldOptionInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type React from 'react';
import { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSearchInput from '../../../components/_app/AppSearchInput/AppSearchInput';
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
  const [updateSampleSpecificDataAttributeValue] =
    apiClient.useUpdateSampleSpecificDataAttributeValueMutation();

  const { data: sachaCommemoratifs } =
    apiClient.useGetSachaCommemoratifsQuery();

  const nextOrder = Math.max(0, ...field.options.map((o) => o.order)) + 1;

  const [formData, setFormData] = useState<FormData>(
    defaultFormData(nextOrder)
  );

  const [sachaValueSigle, setSachaValueSigle] =
    useState<CommemoratifValueSigle | null>(null);

  const selectedSigle = field.sachaCommemoratifSigle;
  const selectedCommemoratif =
    selectedSigle && sachaCommemoratifs
      ? (sachaCommemoratifs[selectedSigle] ?? null)
      : null;
  const valueOptions = selectedCommemoratif
    ? Object.values(selectedCommemoratif.values)
        .map((v) => ({ label: `${v.libelle} (${v.sigle})`, value: v.sigle }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];
  const showSachaField =
    field.sachaInDai &&
    selectedSigle !== null &&
    sachaCommemoratifs !== undefined;

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
      setSachaValueSigle(optionToEdit.sachaCommemoratifValueSigle);
    } else {
      setFormData(defaultFormData(nextOrder));
      setSachaValueSigle(null);
    }
  }, [optionToEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      createFieldOptionResult.reset();
      updateFieldOptionResult.reset();
      setTimeout(() => {
        setFormData(defaultFormData(nextOrder));
        setSachaValueSigle(null);
      }, 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (valid) => {
      try {
        if (optionToEdit) {
          await updateFieldOption({
            fieldId: field.id,
            optionId: optionToEdit.id,
            label: valid.label,
            order: valid.order
          }).unwrap();
        } else {
          await createFieldOption({ fieldId: field.id, ...valid }).unwrap();
        }
        if (showSachaField) {
          await updateSampleSpecificDataAttributeValue({
            attribute: field.key,
            attributeValue: valid.value,
            sachaCommemoratifValueSigle: sachaValueSigle
          }).unwrap();
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
        {showSachaField && (
          <AppSearchInput
            label="Sigle Sacha"
            options={valueOptions}
            value={sachaValueSigle ?? ''}
            onSelect={(v) =>
              setSachaValueSigle((v as CommemoratifValueSigle) || null)
            }
            placeholder="Rechercher une valeur"
            required={!field.sachaOptional}
            state={sachaValueSigle || field.sachaOptional ? 'default' : 'error'}
          />
        )}
        <AppServiceErrorAlert call={createFieldOptionResult} />
        <AppServiceErrorAlert call={updateFieldOptionResult} />
      </form>
    </modal.Component>
  );
};
