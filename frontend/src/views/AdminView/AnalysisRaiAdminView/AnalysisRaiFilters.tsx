import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import {
  AnalysisRaiSource,
  AnalysisRaiState
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import LaboratorySelect from 'src/components/LaboratorySelect/LaboratorySelect';
import type { Filters } from './AnalysisRaiAdminView';

const raiStateLabels: Record<AnalysisRaiState, string> = {
  PROCESSED: 'Traitée',
  INTERNAL_ERROR: 'Erreur',
  REJECTED: 'Rejetée'
};

const raiSourceLabels: Record<AnalysisRaiSource, string> = {
  EMAIL: 'Email',
  SFTP: 'SFTP'
};

type Props = {
  filters: Filters;
  laboratories: Laboratory[];
  onChange: (updates: Partial<Filters>) => void;
};

export const AnalysisRaiFilters = ({
  filters,
  laboratories,
  onChange
}: Props) => {
  const addToLaboratoryIds = (value: string) => {
    if (!filters.laboratoryIds.includes(value)) {
      onChange({ laboratoryIds: [...filters.laboratoryIds, value] });
    }
  };

  const removeLaboratoryId = (value: string) => {
    onChange({
      laboratoryIds: filters.laboratoryIds.filter((v) => v !== value)
    });
  };

  const hasFilters =
    filters.state !== undefined ||
    filters.source !== undefined ||
    filters.laboratoryIds.length > 0 ||
    filters.receivedAtFrom !== undefined ||
    filters.receivedAtTo !== undefined ||
    filters.edi !== undefined;

  return (
    <>
      <div
        className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-2w'))}
      >
        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="État"
            nativeSelectProps={{
              value: filters.state ?? '',
              onChange: (e) =>
                onChange({
                  state: (e.target.value || undefined) as
                    | AnalysisRaiState
                    | undefined
                })
            }}
          >
            <option value="">Tous</option>
            {AnalysisRaiState.options.map((state) => (
              <option key={state} value={state}>
                {raiStateLabels[state]}
              </option>
            ))}
          </Select>
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="Source"
            nativeSelectProps={{
              value: filters.source ?? '',
              onChange: (e) =>
                onChange({
                  source: (e.target.value || undefined) as
                    | AnalysisRaiSource
                    | undefined
                })
            }}
          >
            <option value="">Toutes</option>
            {AnalysisRaiSource.options.map((source) => (
              <option key={source} value={source}>
                {raiSourceLabels[source]}
              </option>
            ))}
          </Select>
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <LaboratorySelect
            programmingPlanId={undefined}
            laboratoryIds={filters.laboratoryIds}
            onSelect={(laboratoryId) => {
              if (laboratoryId) addToLaboratoryIds(laboratoryId);
            }}
          />
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="EDI"
            nativeSelectProps={{
              value:
                filters.edi === true
                  ? 'true'
                  : filters.edi === false
                    ? 'false'
                    : '',
              onChange: (e) =>
                onChange({
                  edi:
                    e.target.value === 'true'
                      ? true
                      : e.target.value === 'false'
                        ? false
                        : undefined
                })
            }}
          >
            <option value="">Tous</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </Select>
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Input
            label="Date de réception (depuis)"
            nativeInputProps={{
              type: 'date',
              value: filters.receivedAtFrom ?? '',
              onChange: (e) =>
                onChange({ receivedAtFrom: e.target.value || undefined })
            }}
          />
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Input
            label="Date de réception (jusqu'au)"
            nativeInputProps={{
              type: 'date',
              value: filters.receivedAtTo ?? '',
              onChange: (e) =>
                onChange({ receivedAtTo: e.target.value || undefined })
            }}
          />
        </div>
      </div>

      {hasFilters && (
        <div
          className={clsx(cx('fr-mb-2w'), 'd-flex-row')}
          style={{ gap: '0.5rem', flexWrap: 'wrap' }}
        >
          {filters.state !== undefined && (
            <Tag
              key={`tag-state-${filters.state}`}
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ state: undefined })
              }}
            >
              {raiStateLabels[filters.state]}
            </Tag>
          )}
          {filters.source !== undefined && (
            <Tag
              key={`tag-source-${filters.source}`}
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ source: undefined })
              }}
            >
              {raiSourceLabels[filters.source]}
            </Tag>
          )}
          {filters.edi !== undefined && (
            <Tag
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ edi: undefined })
              }}
            >
              EDI : {filters.edi ? 'Oui' : 'Non'}
            </Tag>
          )}
          {filters.laboratoryIds.map((id) => {
            const lab = laboratories.find((l) => l.id === id);
            return lab ? (
              <Tag
                key={`tag-lab-${id}`}
                dismissible
                small
                nativeButtonProps={{
                  onClick: () => removeLaboratoryId(id)
                }}
              >
                {lab.name}
              </Tag>
            ) : null;
          })}
          {filters.receivedAtFrom && (
            <Tag
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ receivedAtFrom: undefined })
              }}
            >
              Depuis {filters.receivedAtFrom}
            </Tag>
          )}
          {filters.receivedAtTo && (
            <Tag
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ receivedAtTo: undefined })
              }}
            >
              Jusqu'au {filters.receivedAtTo}
            </Tag>
          )}
        </div>
      )}
    </>
  );
};
