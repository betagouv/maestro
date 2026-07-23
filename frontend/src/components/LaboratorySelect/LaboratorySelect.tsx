import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Box
} from '@mui/material';
import clsx from 'clsx';
import { sortBy } from 'lodash-es';
import {
  getLaboratoryFullName,
  type Laboratory
} from 'maestro-shared/schema/Laboratory/Laboratory';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { toArray } from 'maestro-shared/utils/utils';
import {
  type HTMLAttributes,
  type Key,
  type ReactNode,
  useContext
} from 'react';
import { ApiClientContext } from '../../services/apiClient';
import AppRequiredInput from '../_app/AppRequired/AppRequiredInput';
import './LaboratorySelect.scss';

type Props = {
  programmingPlanId: string | undefined;
  programmingSubPlanId?: ProgrammingSubPlanId;
  substanceKind?: SubstanceKind;
  laboratoryId?: string | null;
  laboratoryIds?: string[];
  onSelect: (laboratoryId?: string) => void;
  readonly?: boolean;
  required?: boolean;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
  hideLabel?: boolean;
  pending?: boolean;
};

const renderLaboratoryOption = (
  optionProps: HTMLAttributes<HTMLLIElement> & { key?: Key },
  option: Laboratory
) => {
  const { key, ...otherProps } = optionProps;
  return (
    <Box key={key} {...otherProps} component="li">
      <div>
        <div>
          <span className={cx('fr-text--bold')}>{option.shortName}</span> •{' '}
          {option.name}
        </div>
        <div className={cx('fr-text--sm', 'fr-m-0')}>
          {option.postalCode} {option.city}
        </div>
      </div>
    </Box>
  );
};

const renderLaboratoryInput =
  (required?: boolean, compact?: boolean, pending?: boolean) =>
  ({ slotProps }: AutocompleteRenderInputParams) => (
    <div ref={slotProps.input.ref}>
      <input
        {...slotProps.htmlInput}
        className={clsx('fr-input', 'laboratory-select-input', {
          'laboratory-select-input--pending': pending
        })}
        type="text"
        placeholder="Rechercher un laboratoire"
        data-testid="laboratorySelect-input"
        required={required}
        style={compact ? { padding: '12px 16px' } : undefined}
      />
    </div>
  );

const LaboratorySelect = ({
  programmingPlanId,
  programmingSubPlanId,
  substanceKind,
  laboratoryId,
  laboratoryIds,
  onSelect,
  readonly,
  required,
  state,
  stateRelatedMessage,
  hideLabel,
  pending
}: Props) => {
  const apiClient = useContext(ApiClientContext);

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({
    programmingPlanIds: toArray(programmingPlanId),
    programmingSubPlanId,
    substanceKind
  });

  const options = sortBy(laboratories ?? [], 'name').filter(
    (lab) => !laboratoryIds?.includes(lab.id)
  );

  const selectedLaboratory =
    laboratories?.find((lab) => lab.id === laboratoryId) ?? null;

  return (
    <div
      className={cx(
        'fr-input-group',
        'fr-mb-0',
        (() => {
          switch (state) {
            case 'error':
              return 'fr-input-group--error';
            case 'success':
              return 'fr-input-group--valid';
            default:
              return undefined;
          }
        })()
      )}
      style={hideLabel ? { padding: '0 16px' } : undefined}
    >
      {!hideLabel && (
        // biome-ignore lint/a11y/noLabelWithoutControl: libellé associé à l'input rendu par renderInput
        <label className={cx('fr-label')}>
          Laboratoire
          {required && <AppRequiredInput />}
        </label>
      )}
      <div className="fr-input-wrap fr-icon-search-line">
        <Autocomplete
          autoComplete
          includeInputInList
          blurOnSelect
          options={options}
          value={selectedLaboratory}
          getOptionLabel={getLaboratoryFullName}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          disabled={readonly}
          renderOption={renderLaboratoryOption}
          onChange={(_, value) => onSelect(value?.id ?? undefined)}
          renderInput={renderLaboratoryInput(required, hideLabel, pending)}
          noOptionsText="Aucun laboratoire"
        />
      </div>
      {state && state !== 'default' && (
        <p
          className={cx(state === 'error' ? 'fr-error-text' : 'fr-valid-text')}
        >
          {stateRelatedMessage}
        </p>
      )}
    </div>
  );
};

export default LaboratorySelect;
