import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { CommemoratifValueSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import {
  AdminFieldConfig,
  AdminFieldOption
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import React, { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSearchInput from '../../../components/_app/AppSearchInput/AppSearchInput';
import { ApiClientContext } from '../../../services/apiClient';

const deleteOptionModal = createModal({
  id: 'specific-data-field-option-delete-modal',
  isOpenedByDefault: false
});

interface Props {
  field: AdminFieldConfig;
  onEdit: (option: AdminFieldOption) => void;
  onCreateNew: () => void;
}

export const FieldOptionsTable = ({
  field,
  onEdit,
  onCreateNew,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateFieldOption] = apiClient.useUpdateFieldOptionMutation();
  const [deleteFieldOption, deleteFieldOptionResult] =
    apiClient.useDeleteFieldOptionMutation();
  const [updateSampleSpecificDataAttributeValue] =
    apiClient.useUpdateSampleSpecificDataAttributeValueMutation();

  const { data: sachaCommemoratifs } =
    apiClient.useGetSachaCommemoratifsQuery();
  const { data: sachaFields = [] } = apiClient.useFindSachaFieldConfigsQuery();
  const sachaField = sachaFields.find((f) => f.key === field.key) ?? null;

  const [optionToDelete, setOptionToDelete] = useState<AdminFieldOption | null>(
    null
  );

  const [selectedValues, setSelectedValues] = useState<
    Record<string, CommemoratifValueSigle>
  >({});

  useEffect(() => {
    if (!sachaField) return;
    setSelectedValues(
      Object.fromEntries(
        sachaField.options
          .filter((o) => o.sachaCommemoratifValueSigle !== null)
          .map((o) => [
            o.value,
            o.sachaCommemoratifValueSigle as CommemoratifValueSigle
          ])
      )
    );
  }, [sachaField?.key, sachaField?.sachaCommemoratifSigle]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedOptions = [...field.options].sort((a, b) => a.order - b.order);

  const moveOption = async (
    option: AdminFieldOption,
    direction: 'up' | 'down'
  ) => {
    const idx = sortedOptions.findIndex((o) => o.id === option.id);
    const adjacentIdx = direction === 'up' ? idx - 1 : idx + 1;
    const adjacent = sortedOptions[adjacentIdx];
    if (!adjacent) return;
    await updateFieldOption({
      fieldId: field.id,
      optionId: option.id,
      body: { order: adjacent.order }
    }).unwrap();
    await updateFieldOption({
      fieldId: field.id,
      optionId: adjacent.id,
      body: { order: option.order }
    }).unwrap();
  };

  const onDeleteClick = (option: AdminFieldOption) => {
    setOptionToDelete(option);
    deleteOptionModal.open();
  };

  const confirmDelete = async () => {
    if (!optionToDelete) return;
    try {
      await deleteFieldOption({
        fieldId: field.id,
        optionId: optionToDelete.id
      }).unwrap();
      deleteOptionModal.close();
    } catch (_e) {
      /* empty */
    }
  };

  const onSelectValue = (
    attributeValue: string,
    sachaCommemoratifValueSigle?: CommemoratifValueSigle
  ) => {
    updateSampleSpecificDataAttributeValue({
      attribute: field.key,
      attributeValue,
      sachaCommemoratifValueSigle: sachaCommemoratifValueSigle ?? null
    });
    setSelectedValues((prev) => {
      if (!sachaCommemoratifValueSigle) {
        const { [attributeValue]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [attributeValue]: sachaCommemoratifValueSigle };
    });
  };

  const selectedSigle = sachaField?.sachaCommemoratifSigle ?? null;
  const selectedCommemoratif =
    selectedSigle && sachaCommemoratifs
      ? (sachaCommemoratifs[selectedSigle] ?? null)
      : null;
  const valueOptions = selectedCommemoratif
    ? Object.values(selectedCommemoratif.values)
        .map((v) => ({ label: `${v.libelle} (${v.sigle})`, value: v.sigle }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const showSachaColumn =
    sachaField !== null &&
    sachaField.inDai &&
    selectedSigle !== null &&
    sachaCommemoratifs !== undefined;

  if (sortedOptions.length === 0) {
    return <p>Aucune option configurée.</p>;
  }

  const actionsHeader = (
    <div
      key="actions-header"
      className={clsx('d-flex-align-center')}
      style={{ justifyContent: 'end' }}
    >
      <Button
        size="small"
        iconId="fr-icon-add-line"
        onClick={onCreateNew}
        title="Ajouter une nouvelle option"
      />
    </div>
  );

  const headers = showSachaColumn
    ? ['Ordre', 'Valeur', 'Libellé', 'Sigle Sacha', actionsHeader]
    : ['Ordre', 'Valeur', 'Libellé', actionsHeader];

  return (
    <>
      <Table
        headers={headers}
        data={sortedOptions.map((option, idx) => {
          const row: (string | React.ReactElement)[] = [
            String(option.order),
            option.value,
            option.label
          ];
          if (showSachaColumn) {
            row.push(
              <AppSearchInput
                key={option.id}
                label=""
                options={valueOptions}
                value={selectedValues[option.value] ?? ''}
                onSelect={(v) =>
                  onSelectValue(option.value, v as CommemoratifValueSigle)
                }
                placeholder="Rechercher une valeur"
                required={!sachaField?.optional}
                state={
                  selectedValues[option.value] || sachaField?.optional
                    ? 'default'
                    : 'error'
                }
              />
            );
          }
          row.push(
            <div
              key={option.id}
              className={clsx(
                'no-wrap',
                cx('fr-btns-group', 'fr-btns-group--inline')
              )}
            >
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-arrow-up-line"
                size="small"
                title="Monter"
                disabled={idx === 0}
                onClick={() => moveOption(option, 'up')}
              />
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-arrow-down-line"
                size="small"
                title="Descendre"
                disabled={idx === sortedOptions.length - 1}
                onClick={() => moveOption(option, 'down')}
              />
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-edit-line"
                size="small"
                title="Modifier"
                onClick={() => onEdit(option)}
              />
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-delete-line"
                size="small"
                title="Supprimer"
                onClick={() => onDeleteClick(option)}
              />
            </div>
          );
          return row;
        })}
        fixed={true}
      />
      <deleteOptionModal.Component
        title="Supprimer l'option"
        concealingBackdrop={false}
        topAnchor
        buttons={[
          { children: 'Annuler', doClosesModal: true, priority: 'secondary' },
          {
            children: 'Supprimer',
            onClick: confirmDelete,
            doClosesModal: false,
            priority: 'primary'
          }
        ]}
      >
        {optionToDelete && (
          <p>
            Êtes-vous sûr de vouloir supprimer l'option{' '}
            <strong>{optionToDelete.label}</strong> ({optionToDelete.value}) ?
          </p>
        )}
        <AppServiceErrorAlert call={deleteFieldOptionResult} />
      </deleteOptionModal.Component>
    </>
  );
};
