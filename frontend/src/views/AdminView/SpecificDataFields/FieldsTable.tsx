import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { assert, type Equals } from 'tsafe';
import { FieldInputTypeLabels } from './fieldInputTypeLabels';

type Props = {
  fields: AdminFieldConfig[];
  sachaFields: SachaFieldConfig[];
  onAdd: () => void;
  onEdit: (field: AdminFieldConfig) => void;
  onDelete: (field: AdminFieldConfig) => void;
};

export const FieldsTable = ({
  fields,
  sachaFields,
  onAdd,
  onEdit,
  onDelete,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const sachaByKey = Object.fromEntries(sachaFields.map((f) => [f.key, f]));

  return (
    <Table
      headers={[
        'Clé',
        'Type de saisie',
        'Libellé',
        'Nb options',
        'DAI Sacha',
        <div
          key="actions-header"
          className={clsx('d-flex-align-center')}
          style={{ justifyContent: 'space-between' }}
        >
          <span>Actions</span>
          <Button
            size="small"
            iconId="fr-icon-add-line"
            onClick={onAdd}
            title="Ajouter un descripteur"
          />
        </div>
      ]}
      data={fields.map((field) => {
        const sacha = sachaByKey[field.key];
        return [
          field.key,
          FieldInputTypeLabels[field.inputType],
          field.label,
          field.options.length > 0 ? String(field.options.length) : '–',
          sacha?.inDai ? 'Oui' : 'Non',
          <div
            key={field.id}
            className={cx('fr-btns-group', 'fr-btns-group--inline')}
          >
            <Button
              priority="tertiary no outline"
              iconId="fr-icon-delete-line"
              size="small"
              title="Supprimer"
              onClick={() => onDelete(field)}
            />
            <Button
              priority="tertiary no outline"
              iconId="fr-icon-arrow-right-line"
              size="small"
              title="Modifier"
              onClick={() => onEdit(field)}
            />
          </div>
        ];
      })}
      fixed={true}
    />
  );
};
