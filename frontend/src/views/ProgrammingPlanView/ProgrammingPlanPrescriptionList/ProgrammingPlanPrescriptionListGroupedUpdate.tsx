import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { getLaboratoryFullname } from 'maestro-shared/referential/Laboratory';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import React from 'react';
import {
  AppSelectOption,
  defaultAppSelectOption
} from 'src/components/_app/AppSelect/AppSelectOption';
import { useFindLaboratoriesQuery } from 'src/services/laboratory.service';
import { pluralize } from 'src/utils/stringUtils';
import './ProgrammingPlanPrescriptionList.scss';
interface Props {
  selectedCount: number;
  totalCount: number;
  onSubmit: (laboratoryId?: string) => Promise<void>;
  onCancel: () => void;
  onSelectAll: () => void;
}

const ProgrammingPlanPrescriptionListGroupedUpdate = ({
  selectedCount,
  totalCount,
  onSubmit,
  onCancel,
  onSelectAll
}: Props) => {
  const [laboratoryId, setLaboratoryId] = React.useState<string>();

  const { data: laboratories } = useFindLaboratoriesQuery();

  const laboratoriesOptions = (
    laboratories: Laboratory[] = []
  ): AppSelectOption[] => [
    defaultAppSelectOption('Sélectionner un laboratoire'),
    ...laboratories.map((laboratory) => ({
      label: getLaboratoryFullname(laboratory.name),
      value: laboratory.id
    }))
  ];

  return (
    <div className={clsx(cx('fr-mt-5w'), 'grouped-update-container')}>
      <div className={clsx(cx('fr-py-4w', 'fr-px-3w'), 'grouped-update-card')}>
        <div>
          <h6 className={cx('fr-mb-1w')}>
            Action groupée
            <span className={cx('fr-text--regular', 'fr-mb-0', 'fr-mx-1w')}>
              • {selectedCount} {pluralize(selectedCount)('sélectionnée')}
            </span>
          </h6>
          <Button
            onClick={onSelectAll}
            priority="tertiary no outline"
            className={clsx(cx('fr-link--sm'), 'link-underline')}
          >
            Tout{' '}
            {totalCount === selectedCount ? 'désélectionner' : 'sélectionner'}
          </Button>
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
            onClick={() => {
              setLaboratoryId(undefined);
              onCancel();
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPlanPrescriptionListGroupedUpdate;
