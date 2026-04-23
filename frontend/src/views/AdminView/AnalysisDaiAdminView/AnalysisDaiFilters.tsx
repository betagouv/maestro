import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { AnalysisDaiSentMethod } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiSentMethod';
import { AnalysisDaiState } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiState';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { Filters } from './AnalysisDaiAdminView';

const daiStateLabels: Record<AnalysisDaiState, string> = {
  SENT: 'Envoyée',
  ERROR: 'Erreur',
  PENDING: 'En attente'
};

const daiSentMethodLabels: Record<AnalysisDaiSentMethod, string> = {
  EMAIL: 'Email',
  SFTP: 'SFTP'
};

type Props = {
  filters: Filters;
  laboratories: Laboratory[];
  onChange: (updates: Partial<Filters>) => void;
};

export const AnalysisDaiFilters = ({
  filters,
  laboratories,
  onChange
}: Props) => {
  const addToArrayFilter = <
    K extends 'states' | 'sentMethods' | 'laboratoryIds'
  >(
    key: K,
    value: Filters[K][number]
  ) => {
    const current = filters[key] as string[];
    if (!current.includes(value as string)) {
      onChange({ [key]: [...current, value] } as Partial<Filters>);
    }
  };

  const removeFromArrayFilter = <
    K extends 'states' | 'sentMethods' | 'laboratoryIds'
  >(
    key: K,
    value: Filters[K][number]
  ) => {
    const current = filters[key] as string[];
    onChange({ [key]: current.filter((v) => v !== value) } as Partial<Filters>);
  };

  const hasFilters =
    filters.states.length > 0 ||
    filters.sentMethods.length > 0 ||
    filters.laboratoryIds.length > 0 ||
    filters.sentDateFrom !== undefined ||
    filters.sentDateTo !== undefined ||
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
              value: '',
              onChange: (e) => {
                if (e.target.value)
                  addToArrayFilter(
                    'states',
                    e.target.value as AnalysisDaiState
                  );
              }
            }}
          >
            <option value="">
              {filters.states.length > 0
                ? `${filters.states.length} sélectionné(s)`
                : 'Tous'}
            </option>
            {AnalysisDaiState.options
              .filter((s) => !filters.states.includes(s))
              .map((state) => (
                <option key={state} value={state}>
                  {daiStateLabels[state]}
                </option>
              ))}
          </Select>
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="Moyen d'envoi"
            nativeSelectProps={{
              value: '',
              onChange: (e) => {
                if (e.target.value)
                  addToArrayFilter(
                    'sentMethods',
                    e.target.value as AnalysisDaiSentMethod
                  );
              }
            }}
          >
            <option value="">
              {filters.sentMethods.length > 0
                ? `${filters.sentMethods.length} sélectionné(s)`
                : 'Tous'}
            </option>
            {AnalysisDaiSentMethod.options
              .filter((m) => !filters.sentMethods.includes(m))
              .map((method) => (
                <option key={method} value={method}>
                  {daiSentMethodLabels[method]}
                </option>
              ))}
          </Select>
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="Laboratoire"
            nativeSelectProps={{
              value: '',
              onChange: (e) => {
                if (e.target.value)
                  addToArrayFilter('laboratoryIds', e.target.value);
              }
            }}
          >
            <option value="">
              {filters.laboratoryIds.length > 0
                ? `${filters.laboratoryIds.length} sélectionné(s)`
                : 'Tous'}
            </option>
            {laboratories
              .filter((lab) => !filters.laboratoryIds.includes(lab.id))
              .map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
          </Select>
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
            label="Date d'envoi (depuis)"
            nativeInputProps={{
              type: 'date',
              value: filters.sentDateFrom ?? '',
              onChange: (e) =>
                onChange({ sentDateFrom: e.target.value || undefined })
            }}
          />
        </div>

        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Input
            label="Date d'envoi (jusqu'au)"
            nativeInputProps={{
              type: 'date',
              value: filters.sentDateTo ?? '',
              onChange: (e) =>
                onChange({ sentDateTo: e.target.value || undefined })
            }}
          />
        </div>
      </div>

      {hasFilters && (
        <div
          className={clsx(cx('fr-mb-2w'), 'd-flex-row')}
          style={{ gap: '0.5rem', flexWrap: 'wrap' }}
        >
          {filters.states.map((state) => (
            <Tag
              key={`tag-state-${state}`}
              dismissible
              small
              nativeButtonProps={{
                onClick: () => removeFromArrayFilter('states', state)
              }}
            >
              {daiStateLabels[state]}
            </Tag>
          ))}
          {filters.sentMethods.map((method) => (
            <Tag
              key={`tag-method-${method}`}
              dismissible
              small
              nativeButtonProps={{
                onClick: () => removeFromArrayFilter('sentMethods', method)
              }}
            >
              {daiSentMethodLabels[method]}
            </Tag>
          ))}
          {filters.laboratoryIds.map((id) => {
            const lab = laboratories.find((l) => l.id === id);
            return lab ? (
              <Tag
                key={`tag-lab-${id}`}
                dismissible
                small
                nativeButtonProps={{
                  onClick: () => removeFromArrayFilter('laboratoryIds', id)
                }}
              >
                {lab.name}
              </Tag>
            ) : null;
          })}
          {filters.sentDateFrom && (
            <Tag
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ sentDateFrom: undefined })
              }}
            >
              Depuis {filters.sentDateFrom}
            </Tag>
          )}
          {filters.sentDateTo && (
            <Tag
              dismissible
              small
              nativeButtonProps={{
                onClick: () => onChange({ sentDateTo: undefined })
              }}
            >
              Jusqu'au {filters.sentDateTo}
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
        </div>
      )}
    </>
  );
};
