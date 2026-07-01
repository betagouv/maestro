import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { fieldInputTypeHasOptions } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { useContext, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AuthenticatedAppRoutes } from 'src/AppRoutes';
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

export const SpecificDataFieldsView = () => {
  const apiClient = useContext(ApiClientContext);
  const navigate = useNavigate();
  const { section, itemId } = useParams();

  const { data: fields = [] } = apiClient.useFindAllFieldConfigsQuery();
  const { data: sachaFields = [] } = apiClient.useFindSachaFieldConfigsQuery();

  const [fieldToDelete, setFieldToDelete] = useState<AdminFieldConfig | null>(
    null
  );

  const goToList = () =>
    navigate(AuthenticatedAppRoutes.AdminRoute.link(section as string));

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
      navigate(
        AuthenticatedAppRoutes.AdminRoute.link(section as string, field.id)
      );
    } else {
      goToList();
    }
  };

  if (itemId === 'create') {
    return (
      <div className={cx('fr-p-2w')}>
        <h3 className={clsx('d-flex-align-center', cx('fr-mt-2w'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-line"
            onClick={goToList}
            title="Retour à la liste"
          ></Button>
          Nouveau descripteur
        </h3>
        <FieldCreateForm onCreated={onCreated} />
      </div>
    );
  }

  if (itemId) {
    const field = fields.find((f) => f.id === itemId);
    if (!field) {
      return null;
    }
    return (
      <div className={cx('fr-p-2w')}>
        <h3 className={clsx('d-flex-align-center', cx('fr-mt-2w'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-line"
            onClick={goToList}
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
        <h3 className={cx('fr-mb-0')}>Dictionnaire des descripteurs</h3>
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
        onAdd={() =>
          navigate(
            AuthenticatedAppRoutes.AdminRoute.link(section as string, 'create')
          )
        }
        onEdit={(field) =>
          navigate(
            AuthenticatedAppRoutes.AdminRoute.link(section as string, field.id)
          )
        }
        onDelete={onDelete}
      />

      <FieldDeleteConfirm
        modal={fieldDeleteModal}
        fieldToDelete={fieldToDelete}
      />
    </div>
  );
};
