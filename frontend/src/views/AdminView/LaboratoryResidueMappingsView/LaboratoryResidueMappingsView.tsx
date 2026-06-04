import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import clsx from 'clsx';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import {
  type SSD2Id,
  SSD2IdSort,
  SSD2Ids
} from 'maestro-shared/referential/Residue/SSD2Id';
import {
  SSD2IdLabel,
  searchSSD2IdByLabel
} from 'maestro-shared/referential/Residue/SSD2Referential';
import { type SyntheticEvent, useContext, useMemo, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';

type Option = { code: SSD2Id; label: string };

const formatOptionLabel = (ssd2Id: SSD2Id): string =>
  `${SSD2IdLabel[ssd2Id]} (${ssd2Id})`;

const toOption = (ssd2Id: SSD2Id | null): Option | null =>
  ssd2Id === null ? null : { code: ssd2Id, label: formatOptionLabel(ssd2Id) };

const searchSSD2Options = (query: string): SSD2Id[] => {
  const lower = query.toLowerCase();
  const byLabel = searchSSD2IdByLabel(query);
  const byReference = (SSD2Ids as SSD2Id[]).filter((id) =>
    id.toLowerCase().includes(lower)
  );
  return Array.from(new Set([...byLabel, ...byReference]));
};

const SSD2Autocomplete = ({
  value,
  onChange
}: {
  value: SSD2Id | null;
  onChange: (next: SSD2Id | null) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Option[]>([]);

  const handleInputChange = (
    _event: SyntheticEvent<Element, Event>,
    nextValue: string
  ) => {
    setSearchQuery(nextValue);
    if (nextValue.length >= 2) {
      setResults(
        searchSSD2Options(nextValue)
          .sort(SSD2IdSort)
          .map((ssd2Id) => ({
            code: ssd2Id,
            label: formatOptionLabel(ssd2Id)
          }))
      );
    } else {
      setResults([]);
    }
  };

  return (
    <Autocomplete
      fullWidth
      autoComplete
      includeInputInList
      value={toOption(value)}
      onInputChange={handleInputChange}
      onChange={(_, next) => onChange(next?.code ?? null)}
      isOptionEqualToValue={(option, candidate) =>
        option.code === candidate?.code
      }
      renderInput={({ slotProps }) => (
        <div ref={slotProps.input.ref}>
          <input
            {...slotProps.htmlInput}
            className="fr-input"
            type="text"
            placeholder="Rechercher un résidu SSD2"
          />
        </div>
      )}
      filterOptions={(x) => x}
      options={results}
      getOptionLabel={(option) => option.label}
      noOptionsText={
        searchQuery.length >= 2
          ? 'Aucun résultat'
          : 'Saisir au moins 2 caractères'
      }
    />
  );
};

const addMappingModal = createModal({
  id: 'add-laboratory-residue-mapping-modal',
  isOpenedByDefault: false
});

const AddMappingModal = ({
  laboratoryId,
  existingLabels
}: {
  laboratoryId: string;
  existingLabels: string[];
}) => {
  const apiClient = useContext(ApiClientContext);
  const [update] = apiClient.useUpdateLaboratoryResidueMappingMutation();
  const [label, setLabel] = useState('');
  const [ssd2Id, setSsd2Id] = useState<SSD2Id | null>(null);

  const trimmedLabel = label.trim();
  const isDuplicate = existingLabels.includes(trimmedLabel);
  const canSubmit = trimmedLabel.length > 0 && !isDuplicate;

  const submit = async () => {
    if (!canSubmit) return;
    await update({ laboratoryId, label: trimmedLabel, ssd2Id }).unwrap();
    setLabel('');
    setSsd2Id(null);
    addMappingModal.close();
  };

  return (
    <addMappingModal.Component
      title="Ajouter un mapping"
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          onClick: () => {
            setLabel('');
            setSsd2Id(null);
          }
        },
        {
          children: 'Ajouter',
          disabled: !canSubmit,
          onClick: submit,
          doClosesModal: false
        }
      ]}
    >
      <Input
        label="Libellé du laboratoire"
        state={isDuplicate ? 'error' : 'default'}
        stateRelatedMessage={
          isDuplicate
            ? 'Ce libellé existe déjà pour ce laboratoire.'
            : undefined
        }
        nativeInputProps={{
          value: label,
          onChange: (e) => setLabel(e.target.value)
        }}
      />
      {/** biome-ignore lint/a11y/noLabelWithoutControl: Autocomplete custom */}
      <label className={cx('fr-label', 'fr-mb-1w')}>Résidu SSD2</label>
      <SSD2Autocomplete value={ssd2Id} onChange={setSsd2Id} />
    </addMappingModal.Component>
  );
};

export const LaboratoryResidueMappingsView = () => {
  const apiClient = useContext(ApiClientContext);
  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});
  const automatedLaboratories = useMemo(
    () =>
      laboratories.filter((laboratory) =>
        (LaboratoryWithAutomation as readonly string[]).includes(
          laboratory.shortName
        )
      ),
    [laboratories]
  );
  const [selectedLaboratoryId, setSelectedLaboratoryId] = useState<string>('');

  const { data: mappings = [] } =
    apiClient.useFindLaboratoryResidueMappingsQuery(
      { laboratoryId: selectedLaboratoryId },
      { skip: selectedLaboratoryId === '' }
    );

  const { data: orphanLabels = [] } =
    apiClient.useFindLaboratoryOrphanResidueLabelsQuery(
      { laboratoryId: selectedLaboratoryId },
      { skip: selectedLaboratoryId === '' }
    );

  const [update] = apiClient.useUpdateLaboratoryResidueMappingMutation();

  const [labelFilter, setLabelFilter] = useState('');
  const [ssd2IdFilter, setSsd2IdFilter] = useState<SSD2Id | null>(null);

  const filteredMappings = useMemo(() => {
    const normalized = labelFilter.trim().toLowerCase();
    return mappings
      .filter((m) =>
        normalized === '' ? true : m.label.toLowerCase().includes(normalized)
      )
      .filter((m) => (ssd2IdFilter === null ? true : m.ssd2Id === ssd2IdFilter))
      .sort((a, b) => {
        if ((a.ssd2Id === null) !== (b.ssd2Id === null)) {
          return a.ssd2Id === null ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
      });
  }, [mappings, labelFilter, ssd2IdFilter]);

  const filteredOrphanLabels = useMemo(() => {
    const normalized = labelFilter.trim().toLowerCase();
    return [...orphanLabels]
      .filter((label) =>
        normalized === '' ? true : label.toLowerCase().includes(normalized)
      )
      .filter(() => ssd2IdFilter === null)
      .sort((a, b) => a.localeCompare(b));
  }, [orphanLabels, labelFilter, ssd2IdFilter]);

  const existingLabels = useMemo(
    () => mappings.map((m) => m.label),
    [mappings]
  );

  return (
    <div className={cx('fr-p-2w')}>
      <h3>Dictionnaire d'analytes</h3>
      <Select
        label="Laboratoire"
        nativeSelectProps={{
          value: selectedLaboratoryId,
          onChange: (e) => setSelectedLaboratoryId(e.target.value)
        }}
      >
        <option value="" disabled>
          Sélectionner un laboratoire
        </option>
        {automatedLaboratories.map((laboratory) => (
          <option key={laboratory.id} value={laboratory.id}>
            {laboratory.name}
          </option>
        ))}
      </Select>

      {selectedLaboratoryId !== '' && (
        <>
          <div
            className={clsx(
              cx('fr-mt-2w', 'fr-grid-row', 'fr-grid-row--gutters')
            )}
          >
            <div className={cx('fr-col-12', 'fr-col-md-6')}>
              <Input
                label="Rechercher un libellé"
                nativeInputProps={{
                  value: labelFilter,
                  onChange: (e) => setLabelFilter(e.target.value),
                  placeholder: 'Filtrer par libellé'
                }}
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-6')}>
              {/** biome-ignore lint/a11y/noLabelWithoutControl: Autocomplete custom */}
              <label className={cx('fr-label', 'fr-mb-1w')}>
                Filtrer par résidu SSD2
              </label>
              <SSD2Autocomplete
                value={ssd2IdFilter}
                onChange={setSsd2IdFilter}
              />
            </div>
          </div>
          <Table
            noCaption
            fixed
            className={cx('fr-mt-2w')}
            headers={[
              'Libellé laboratoire',
              <div
                key="ssd2-header"
                className={clsx('d-flex-align-center')}
                style={{ justifyContent: 'space-between' }}
              >
                <span>Résidu SSD2</span>
                <Button
                  size="small"
                  iconId="fr-icon-add-line"
                  onClick={() => addMappingModal.open()}
                  title="Ajouter un mapping"
                />
              </div>
            ]}
            data={[
              ...filteredOrphanLabels.map((label) => {
                const suggestions = searchSSD2IdByLabel(label).slice(0, 3);
                return [
                  <span
                    key={`orphan-label-${label}`}
                    className={clsx('d-flex-align-center')}
                  >
                    <Badge severity="new" small className={cx('fr-mr-1w')}>
                      Nouveau
                    </Badge>
                    {label}
                  </span>,
                  <div key={`orphan-${selectedLaboratoryId}-${label}`}>
                    <SSD2Autocomplete
                      value={null}
                      onChange={(ssd2Id) =>
                        update({
                          laboratoryId: selectedLaboratoryId,
                          label,
                          ssd2Id
                        })
                      }
                    />
                    {suggestions.length > 0 && (
                      <div className={cx('fr-mt-1w')}>
                        {suggestions.map((suggestion) => (
                          <Tag
                            key={`${label}-suggestion-${suggestion}`}
                            small
                            nativeButtonProps={{
                              onClick: () =>
                                update({
                                  laboratoryId: selectedLaboratoryId,
                                  label,
                                  ssd2Id: suggestion
                                })
                            }}
                            className={cx('fr-mr-1v', 'fr-mb-1v')}
                          >
                            {SSD2IdLabel[suggestion]} ({suggestion})
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                ];
              }),
              ...filteredMappings.map((mapping) => [
                mapping.label,
                <SSD2Autocomplete
                  key={`${selectedLaboratoryId}-${mapping.label}`}
                  value={mapping.ssd2Id}
                  onChange={(ssd2Id) =>
                    update({
                      laboratoryId: selectedLaboratoryId,
                      label: mapping.label,
                      ssd2Id
                    })
                  }
                />
              ])
            ]}
          />
          <AddMappingModal
            laboratoryId={selectedLaboratoryId}
            existingLabels={existingLabels}
          />
        </>
      )}
    </div>
  );
};
