import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { capitalize } from 'lodash-es';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import {
  Referential,
  SSD2Referential
} from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  AnalysisMethod,
  AnalysisMethodLabels
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { Substance } from 'maestro-shared/schema/Substance/Substance';
import { SyntheticEvent, useState } from 'react';
import { useLazySearchSubstancesQuery } from '../../services/substance.service';

interface Props {
  analysisMethod: AnalysisMethod;
  substances: SSD2Id[];
  onChangeSubstances: (substances: SSD2Id[]) => void | Promise<void>;
  readonly?: boolean;
  addButtonMode?: 'icon' | 'text';
}

const SubstanceSearch = ({
  analysisMethod,
  substances,
  onChangeSubstances,
  readonly,
  addButtonMode = 'icon'
}: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [substanceSearchResults, setSubstanceSearchResults] = useState<
    Substance[]
  >([]);
  const [searchSubstances, { isLoading, isFetching }] =
    useLazySearchSubstancesQuery();
  const [newSubstance, setNewSubstance] = useState<Substance | null>(null);

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (value.length > 3) {
      await searchSubstances(value as string)
        .unwrap()
        .then((results) => {
          setSubstanceSearchResults(
            results.filter(
              ({ code }) => !substances.some((substance) => substance === code)
            )
          );
        })
        .catch((error) => {
          console.error(error);
        });
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
        {capitalize(AnalysisMethodLabels[analysisMethod])}
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
            onChange={(_, value) => {
              if (value) {
                setNewSubstance(value);
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
            loading={isLoading || isFetching}
            loadingText={`Recherche en cours...`}
            filterOptions={(x) => x}
            options={substanceSearchResults}
            getOptionLabel={(option) => option.label}
            noOptionsText={
              searchQuery.length > 3
                ? 'Aucun résultat'
                : 'Saisir au moins 4 caractères'
            }
          />
          <Button
            iconId={addButtonMode === 'icon' ? 'fr-icon-add-line' : undefined}
            priority="secondary"
            title="Ajouter"
            children={addButtonMode === 'text' ? 'Ajouter' : undefined}
            disabled={!newSubstance}
            onClick={async () => {
              await addSubstance(newSubstance?.code as SSD2Id);
            }}
            className={cx('fr-ml-2w')}
          />
        </div>
      )}

      <div className="fr-mt-1w">
        {substances.map((substance) => (
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
            {(SSD2Referential as Referential)[substance].name}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SubstanceSearch;
