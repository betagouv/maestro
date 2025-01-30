import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useState } from 'react';
import {
  AppSelectOption,
  defaultAppSelectOption
} from 'src/components/_app/AppSelect/AppSelectOption';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';

interface Props {
  regionalPrescription: RegionalPrescription;
  onChangeLaboratory: (laboratoryId: string) => Promise<void>;
}

const RegionalPrescriptionLaboratory = ({
  regionalPrescription,
  onChangeLaboratory
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(regionalPrescription.laboratoryId);

  const { data: laboratories } = useFindLaboratoriesQuery();

  const submit = () => {
    if (value && value !== regionalPrescription.laboratoryId) {
      onChangeLaboratory(value);
    }
    setIsEditing(false);
  };

  const laboratoriesOptions = (
    laboratories: Laboratory[] = []
  ): AppSelectOption[] => [
    defaultAppSelectOption('Sélectionner un laboratoire'),
    ...laboratories.map((laboratory) => ({
      label: laboratory.name,
      value: laboratory.id
    }))
  ];

  const currentLaboratory = laboratories?.find(
    (laboratory) => laboratory.id === regionalPrescription.laboratoryId
  );

  return (
    <>
      {isEditing ? (
        <div className="d-flex-align-center">
          <Select
            label={undefined}
            nativeSelectProps={{
              value: value ?? '',
              autoFocus: true,
              onChange: (e) => setValue(e.target.value)
            }}
            className={cx('fr-mb-0')}
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
          <Button
            iconId="fr-icon-add-line"
            priority="secondary"
            title="Ajouter"
            onClick={submit}
            className={cx('fr-ml-2w')}
          />
        </div>
      ) : (
        <Button
          priority="tertiary no outline"
          size="small"
          className={clsx(cx('fr-link--sm', 'fr-mt-1w'), 'link-underline')}
          onClick={() => setIsEditing(true)}
        >
          {currentLaboratory ? (
            <>
              <span
                className={cx('fr-icon-edit-line', 'fr-icon--sm', 'fr-mr-1w')}
              />
              Laboratoire {currentLaboratory.name}
            </>
          ) : (
            <>
              <span
                className={cx(
                  'fr-icon-microscope-line',
                  'fr-icon--sm',
                  'fr-mr-1w'
                )}
              />
              Ajouter un laboratoire
            </>
          )}
        </Button>
      )}
    </>
  );
};

export default RegionalPrescriptionLaboratory;
