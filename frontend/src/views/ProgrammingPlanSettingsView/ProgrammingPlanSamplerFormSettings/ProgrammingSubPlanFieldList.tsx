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

  const replaceAt = (
    index: number,
    field: ProgrammingSubPlanFieldSetting
  ): void => onChange(fields.map((_, i) => (i === index ? field : _)));

  const moveField = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    const moved = [...fields];
    const [field] = moved.splice(index, 1);
    moved.splice(target, 0, field);
    onChange(moved);
  };

  const confirmDelete = (): void => {
    if (indexToDelete !== null) {
      onChange(fields.filter((_, i) => i !== indexToDelete));
    }
    deleteFieldModal.close();
  };

  if (fields.length === 0) {
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
        {fields.map((field, index) => (
          <ProgrammingSubPlanFieldItem
            key={field.fieldId}
            field={field}
            globalField={allFields.find(({ id }) => id === field.fieldId)}
            canMoveUp={index > 0 && !fields[index - 1].managedAtPlanLevel}
            canMoveDown={index < fields.length - 1}
            onChange={(updated) => replaceAt(index, updated)}
            onMoveUp={() => moveField(index, -1)}
            onMoveDown={() => moveField(index, 1)}
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
