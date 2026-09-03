import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type {
  AdminFieldConfig,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { assert, type Equals } from 'tsafe';
import { ProgrammingSubPlanFieldItem } from './ProgrammingSubPlanFieldItem';

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

  const deleteAt = (index: number): void => {
    const target = fields[index];
    onChange(
      target.managedAtPlanLevel
        ? fields.map((field, i) =>
            i === index ? { ...field, inheritance: 'Excluded' as const } : field
          )
        : fields.filter((_, i) => i !== index)
    );
  };

  if (visibleFields.length === 0) {
    return (
      <p className={cx('fr-text--sm')}>
        Aucun champ configuré pour ce sous-plan.
      </p>
    );
  }

  return (
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
          onDelete={() => deleteAt(index)}
        />
      ))}
    </div>
  );
};
