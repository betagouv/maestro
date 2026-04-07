import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from '../../../services/apiClient';
import { PlanKindFieldItem } from './PlanKindFieldItem';

const deleteFieldModal = createModal({
  id: 'plan-kind-field-delete-modal',
  isOpenedByDefault: false
});

interface Props {
  programmingPlanId: string;
  kind: ProgrammingPlanKind;
  planKindFields: PlanKindFieldConfig[];
  allFields: AdminFieldConfig[];
}

export const PlanKindFieldList = ({
  programmingPlanId,
  kind,
  planKindFields,
  allFields,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updatePlanKindField] = apiClient.useUpdatePlanKindFieldMutation();
  const [deletePlanKindField, deletePlanKindFieldResult] =
    apiClient.useDeletePlanKindFieldMutation();

  const [fieldToDelete, setFieldToDelete] =
    useState<PlanKindFieldConfig | null>(null);

  const sortedFields = [...planKindFields].sort((a, b) => a.order - b.order);

  const moveField = async (
    item: PlanKindFieldConfig,
    direction: 'up' | 'down'
  ) => {
    const idx = sortedFields.findIndex((f) => f.id === item.id);
    const adjacentIdx = direction === 'up' ? idx - 1 : idx + 1;
    const adjacent = sortedFields[adjacentIdx];
    if (!adjacent) return;
    await updatePlanKindField({
      programmingPlanId,
      kind,
      planKindFieldId: item.id,
      required: item.required,
      order: adjacent.order
    }).unwrap();
    await updatePlanKindField({
      programmingPlanId,
      kind,
      planKindFieldId: adjacent.id,
      required: adjacent.required,
      order: item.order
    }).unwrap();
  };

  const onDeleteClick = (item: PlanKindFieldConfig) => {
    setFieldToDelete(item);
    deleteFieldModal.open();
  };

  const confirmDelete = async () => {
    if (!fieldToDelete) return;
    try {
      await deletePlanKindField({
        programmingPlanId,
        kind,
        planKindFieldId: fieldToDelete.id
      }).unwrap();
      deleteFieldModal.close();
    } catch (_e) {
      /* empty */
    }
  };

  if (sortedFields.length === 0) {
    return (
      <p className={cx('fr-text--sm')}>
        Aucun champ configuré pour ce type de plan.
      </p>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedFields.map((item, idx) => {
          const globalField = allFields.find((f) => f.key === item.field.key);
          return (
            <PlanKindFieldItem
              key={item.id}
              item={item}
              programmingPlanId={programmingPlanId}
              kind={kind}
              globalField={globalField}
              isFirst={idx === 0}
              isLast={idx === sortedFields.length - 1}
              onMoveUp={() => moveField(item, 'up')}
              onMoveDown={() => moveField(item, 'down')}
              onDelete={() => onDeleteClick(item)}
            />
          );
        })}
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
            <strong>{fieldToDelete.field.label}</strong> de ce type de plan ?
          </p>
        )}
        <AppServiceErrorAlert call={deletePlanKindFieldResult} />
      </deleteFieldModal.Component>
    </>
  );
};
