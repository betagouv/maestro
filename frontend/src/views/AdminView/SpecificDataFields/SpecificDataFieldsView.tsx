import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { fieldInputTypeHasOptions } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { useContext, useMemo, useState } from 'react';
import { ApiClientContext } from '../../../services/apiClient';
import { FieldCreateForm } from './FieldCreateForm';
import { FieldDeleteConfirm } from './FieldDeleteConfirm';
import { FieldForm } from './FieldForm';
import { FieldOptionsSection } from './FieldOptionsSection';
import { FieldsTable } from './FieldsTable';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';

const fieldDeleteModal = createModal({
  id: 'specific-data-field-delete-modal',
  isOpenedByDefault: false
});

type View = 'list' | 'create' | AdminFieldConfig;

export const SpecificDataFieldsView = () => {
  const apiClient = useContext(ApiClientContext);

  const { data: fields = [] } = apiClient.useFindAllFieldConfigsQuery();
  const { data: sachaFields = [] } = apiClient.useFindSachaFieldConfigsQuery();

  const [view, setView] = useState<View>('list');
  const [fieldToDelete, setFieldToDelete] = useState<AdminFieldConfig | null>(
    null
  );

  const isComplete = useMemo(() => {
    for (const fc of sachaFields) {
      if (fc.inDai && !fc.optional) {
        if (!fc.sachaCommemoratifSigle) {
          return false;
        }
        if (
          fieldInputTypeHasOptions(fc.inputType) &&
          fc.options.some((o) => !o.sachaCommemoratifValueSigle)
        ) {
          return false;
        }
      }
    }
    return true;
  }, [sachaFields]);

  const onDelete = (field: AdminFieldConfig) => {
    setFieldToDelete(field);
    fieldDeleteModal.open();
  };

  const onCreated = (field: AdminFieldConfig) => {
    if (fieldInputTypeHasOptions(field.inputType)) {
      setView(field);
    } else {
      setView('list');
    }
  };

  if (view === 'create') {
    return (
      <div className={cx('fr-p-2w')}>
        <h3 className={clsx('d-flex-align-center', cx('fr-mt-2w'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-line"
            onClick={() => setView('list')}
            title="Retour à la liste"
          ></Button>
          Nouveau descripteur
        </h3>
        <FieldCreateForm onCreated={onCreated} />
      </div>
    );
  }

  if (view !== 'list') {
    const field = fields.find((f) => f.id === view.id) ?? view;
    return (
      <div className={cx('fr-p-2w')}>
        <h3 className={clsx('d-flex-align-center', cx('fr-mt-2w'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-line"
            onClick={() => setView('list')}
            title="Retour à la liste"
          />
          Descripteur : <code>{field.key}</code>
        </h3>
        <div className={clsx('white-container', cx('fr-px-10w', 'fr-py-8w'))}>
          <FieldForm field={field} />
          <FieldOptionsSection field={field} />
        </div>
      </div>
    );
  }

  return (
    <div className={cx('fr-p-2w')}>
      <div
        className={clsx('d-flex-row', 'd-flex-align-center', cx('fr-mb-2w'))}
      >
        <h3 className={cx('fr-mb-0')}>Configuration des descripteurs</h3>
        <SachaCommemoratifsUpload />
      </div>

      {!isComplete && (
        <Alert
          severity="warning"
          title="Configuration incomplète"
          description="Certaines DAI ne sont pas envoyables via les EDI Sacha."
          className={clsx(cx('fr-mb-2w'))}
        />
      )}

      <FieldsTable
        fields={fields}
        sachaFields={sachaFields}
        onAdd={() => setView('create')}
        onEdit={(field) => setView(field)}
        onDelete={onDelete}
      />

      <FieldDeleteConfirm
        modal={fieldDeleteModal}
        fieldToDelete={fieldToDelete}
      />
    </div>
  );
};
