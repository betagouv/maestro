import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { capitalize } from 'lodash-es';
import { SSD2Id, SSD2IdSort } from 'maestro-shared/referential/Residue/SSD2Id';
import {
  searchSSD2IdByLabel,
  SSD2IdLabel
} from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  AnalysisMethod,
  AnalysisMethodLabels
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { SyntheticEvent, useState } from 'react';

interface Props {
  analysisMethod: AnalysisMethod;
  substances: SSD2Id[];
  onChangeSubstances: (substances: SSD2Id[]) => void | Promise<void>;
  readonly?: boolean;
  addButtonMode?: 'icon' | 'none';
  label?: string;
}

const SubstanceSearch = ({
  analysisMethod,
  substances,
  onChangeSubstances,
  readonly,
  addButtonMode = 'icon',
  label
}: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [substanceSearchResults, setSubstanceSearchResults] = useState<
    { code: SSD2Id; label: string }[]
  >([]);
  const [newSubstance, setNewSubstance] = useState<{
    code: SSD2Id;
    label: string;
  } | null>(null);

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (value.length > 3) {
      setSubstanceSearchResults(
        searchSSD2IdByLabel(value)
          .sort(SSD2IdSort)
          .map((ssd2Id) => ({
            code: ssd2Id,
            label: SSD2IdLabel[ssd2Id]
          }))
      );
    } else {
      setSubstanceSearchResults([]);
    }
  };

  const addSubstance = async (substance: SSD2Id) => {
    await onChangeSubstances([...substances, substance]);
    setNewSubstance(null);
  };

  const removeSubstance = async (substance: SSD2Id) => {
    await onChangeSubstances(substances.filter((_) => _ !== substance));
  };

  return (
    <div>
      <label className={cx('fr-label', 'fr-mb-1w')}>
        {label ?? capitalize(AnalysisMethodLabels[analysisMethod])}
      </label>
      {!readonly && (
        <div className="d-flex-align-center">
          <Autocomplete
            fullWidth
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={newSubstance}
            onInputChange={handleInputChange}
            onChange={async (_, value) => {
              if (value) {
                setNewSubstance(value);
                if (addButtonMode === 'none') {
                  await addSubstance(value.code);
                }
              }
            }}
            isOptionEqualToValue={(option, value) =>
              option.code === value?.code
            }
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  {...params.inputProps}
                  className="fr-input"
                  type="text"
                  placeholder={'Rechercher par libellé'}
                />
              </div>
            )}
            filterOptions={(x) => x}
            options={substanceSearchResults}
            getOptionLabel={(option) => option.label}
            noOptionsText={
              searchQuery.length > 3
                ? 'Aucun résultat'
                : 'Saisir au moins 4 caractères'
            }
          />
          {addButtonMode !== 'none' && (
            <Button
              iconId="fr-icon-add-line"
              priority="secondary"
              title="Ajouter"
              disabled={!newSubstance}
              onClick={async () => {
                await addSubstance(newSubstance?.code as SSD2Id);
              }}
              className={cx('fr-ml-2w')}
            />
          )}
        </div>
      )}

      <div className="fr-mt-1w">
        {[...substances].sort(SSD2IdSort).map((substance) => (
          <Tag
            key={`${analysisMethod}-${substance}`}
            dismissible={!readonly}
            small
            nativeButtonProps={
              !readonly
                ? {
                    onClick: async () => {
                      removeSubstance(substance);
                    }
                  }
                : undefined
            }
            className={cx('fr-m-1v')}
          >
            {SSD2IdLabel[substance]}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SubstanceSearch;
