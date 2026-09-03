import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type {
  AdminFieldConfig,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { ProgrammingSubPlanFieldItem } from './ProgrammingSubPlanFieldItem';

const deleteFieldModal = createModal({
  id: 'sampler-form-field-delete-modal',
  isOpenedByDefault: false
});

interface Props {
  fields: ProgrammingSubPlanFieldSetting[];
  onChange: (fields: ProgrammingSubPlanFieldSetting[]) => void;
  allFields: AdminFieldConfig[];
}

export const ProgrammingSubPlanFieldList = ({
  fields,
  onChange,
  allFields,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

  const visibleFields = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.inheritance !== 'Excluded');

  const replaceAt = (
    index: number,
    field: ProgrammingSubPlanFieldSetting
  ): void => onChange(fields.map((_, i) => (i === index ? field : _)));

  const moveField = (fromIndex: number, toIndex: number): void => {
    const moved = [...fields];
    [moved[fromIndex], moved[toIndex]] = [moved[toIndex], moved[fromIndex]];
    onChange(moved);
  };

  const confirmDelete = (): void => {
    if (indexToDelete !== null) {
      const target = fields[indexToDelete];
      onChange(
        target.managedAtPlanLevel
          ? fields.map((field, i) =>
              i === indexToDelete
                ? { ...field, inheritance: 'Excluded' as const }
                : field
            )
          : fields.filter((_, i) => i !== indexToDelete)
      );
    }
    deleteFieldModal.close();
  };

  if (visibleFields.length === 0) {
    return (
      <p className={cx('fr-text--sm')}>
        Aucun champ configuré pour ce sous-plan.
      </p>
    );
  }

  const fieldToDelete =
    indexToDelete === null ? undefined : fields[indexToDelete];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visibleFields.map(({ field, index }, i) => (
          <ProgrammingSubPlanFieldItem
            key={field.fieldId}
            field={field}
            globalField={allFields.find(({ id }) => id === field.fieldId)}
            canMoveUp={i > 0 && !visibleFields[i - 1].field.managedAtPlanLevel}
            canMoveDown={i < visibleFields.length - 1}
            onChange={(updated) => replaceAt(index, updated)}
            onMoveUp={() => moveField(index, visibleFields[i - 1].index)}
            onMoveDown={() => moveField(index, visibleFields[i + 1].index)}
            onDelete={() => {
              setIndexToDelete(index);
              deleteFieldModal.open();
            }}
          />
        ))}
      </div>

      <deleteFieldModal.Component
        title="Retirer le champ"
        concealingBackdrop={false}
        topAnchor
        buttons={[
          {
            children: 'Annuler',
            doClosesModal: true,
            priority: 'secondary'
          },
          {
            children: 'Retirer',
            onClick: confirmDelete,
            doClosesModal: false,
            priority: 'primary'
          }
        ]}
      >
        {fieldToDelete && (
          <p>
            Êtes-vous sûr de vouloir retirer le champ{' '}
            <strong>
              {allFields.find(({ id }) => id === fieldToDelete.fieldId)?.label}
            </strong>{' '}
            de ce sous-plan ?
          </p>
        )}
      </deleteFieldModal.Component>
    </>
  );
};
