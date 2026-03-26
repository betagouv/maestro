import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type {
  AdminFieldConfig,
  AdminFieldOption
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { fieldInputTypeHasOptions } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { FieldOptionFormModal } from './FieldOptionFormModal';
import { FieldOptionsTable } from './FieldOptionsTable';

const optionFormModal = createModal({
  id: 'specific-data-field-option-form-modal',
  isOpenedByDefault: false
});

interface Props {
  field: AdminFieldConfig;
}

export const FieldOptionsSection = ({ field, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [selectedOption, setSelectedOption] = useState<AdminFieldOption | null>(
    null
  );

  if (!fieldInputTypeHasOptions(field.inputType)) {
    return null;
  }

  const onEdit = (option: AdminFieldOption) => {
    setSelectedOption(option);
    optionFormModal.open();
  };

  const onCreateNew = () => {
    setSelectedOption(null);
    optionFormModal.open();
  };

  return (
    <section>
      <h3 className={cx('fr-mb-0')}>Options</h3>
      <FieldOptionsTable
        field={field}
        onEdit={onEdit}
        onCreateNew={onCreateNew}
      />
      <FieldOptionFormModal
        modal={optionFormModal}
        field={field}
        optionToEdit={selectedOption}
      />
    </section>
  );
};
