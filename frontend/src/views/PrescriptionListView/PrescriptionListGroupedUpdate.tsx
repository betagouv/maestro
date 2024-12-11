import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import React from 'react';
import { Laboratory } from 'shared/schema/Laboratory/Laboratory';
import {
  AppSelectOption,
  defaultAppSelectOption
} from 'src/components/_app/AppSelect/AppSelectOption';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';
import { pluralize } from 'src/utils/stringUtils';
import './PrescriptionListView.scss';
interface Props {
  selectedCount: number;
  onSubmit: (laboratoryId?: string) => Promise<void>;
  onCancel: () => void;
}

const PrescriptionListGroupedUpdate = ({
  selectedCount,
  onSubmit,
  onCancel
}: Props) => {
  const [laboratoryId, setLaboratoryId] = React.useState<string>();

  const { data: laboratories } = useFindLaboratoriesQuery();

  const laboratoriesOptions = (
    laboratories: Laboratory[] = []
  ): AppSelectOption[] => [
    defaultAppSelectOption('Sélectionner un laboratoire'),
    ...laboratories.map((laboratory) => ({
      label: laboratory.name,
      value: laboratory.id
    }))
  ];

  return (
    <div className={clsx(cx('fr-mt-5w'), 'grouped-update-container')}>
      {selectedCount > 0 ? (
        <div
          className={clsx(cx('fr-py-4w', 'fr-px-3w'), 'grouped-update-card')}
        >
          <div>
            <h6 className={cx('fr-mb-1w')}>Action groupée</h6>
            {selectedCount} {pluralize(selectedCount)('matrice')} sélectionnée
          </div>
          <Select
            label="Laboratoire"
            nativeSelectProps={{
              value: laboratoryId ?? '',
              autoFocus: true,
              onChange: (e) => setLaboratoryId(e.target.value)
            }}
            className={cx('fr-mr-2w', 'fr-mb-0')}
          >
            {laboratoriesOptions(laboratories).map((option) => (
              <option
                label={option.label}
                value={option.value}
                disabled={option.disabled}
                selected={option.selected}
                hidden={option.hidden}
                key={`option_${option.value}`}
              ></option>
            ))}
          </Select>
          <div>
            <Button
              className={cx('fr-mr-2w')}
              onClick={async () => {
                await onSubmit(laboratoryId);
                setLaboratoryId(undefined);
              }}
            >
              Mettre à jour
            </Button>
          </div>
          <div>
            <Button
              priority="secondary"
              onClick={() => setLaboratoryId(undefined)}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Alert
          description="Vous devez sélectionner au moins une matrice pour effectuer une action"
          onClose={onCancel}
          severity="warning"
          small
          closable
        />
      )}
    </div>
  );
};

export default PrescriptionListGroupedUpdate;
