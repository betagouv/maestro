import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { ProgrammingSubPlanFieldSetting } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { useContext } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { AddFieldToProgrammingSubPlanModal } from './AddFieldToProgrammingSubPlanModal';
import { ProgrammingSubPlanFieldList } from './ProgrammingSubPlanFieldList';

const addFieldModal = createModal({
  id: 'sampler-form-add-field-modal',
  isOpenedByDefault: false
});

type Props = {
  fields: ProgrammingSubPlanFieldSetting[];
  onChange: (fields: ProgrammingSubPlanFieldSetting[]) => void;
};

export const ProgrammingPlanSamplerFormSettings = ({
  fields,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const { data: allFields = [] } = apiClient.useFindAllFieldConfigsQuery();

  const availableFields = allFields.filter(
    (globalField) => !fields.some(({ fieldId }) => fieldId === globalField.id)
  );

  return (
    <>
      <div
        className={clsx('d-flex-row', 'd-flex-align-center', cx('fr-mb-2w'))}
      >
        <h5 className={cx('fr-mb-0')}>Champs actifs</h5>
        <Button
          className={cx('fr-ml-auto')}
          iconId="fr-icon-add-line"
          onClick={() => addFieldModal.open()}
          disabled={availableFields.length === 0}
        >
          Ajouter un champ
        </Button>
      </div>

      <ProgrammingSubPlanFieldList
        fields={fields}
        onChange={onChange}
        allFields={allFields}
      />

      <AddFieldToProgrammingSubPlanModal
        modal={addFieldModal}
        availableFields={availableFields}
        onAdd={(field) => onChange([...fields, field])}
      />
    </>
  );
};
