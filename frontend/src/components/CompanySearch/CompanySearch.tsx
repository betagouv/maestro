import { Autocomplete } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { Department } from 'shared/referential/Department';
import { CompanySearchResult } from 'shared/schema/Company/CompanySearchResult';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { useLazySearchCompaniesQuery } from 'src/services/company.service';

interface Props {
  department?: Department;
  onSelectCompany: (company?: CompanySearchResult) => void;
}

const CompanySearch = ({ department, onSelectCompany }: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companySearchResults, setCompanySearchResults] = useState<
    CompanySearchResult[]
  >([]);
  const [searchCompanies, { isLoading, isFetching }] =
    useLazySearchCompaniesQuery();
  const [company, setCompany] = useState<CompanySearchResult>();

  const handleInputChange = async (
    event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);
    // setCompanySearchResults([]);

    if (value.length > 3) {
      await searchCompanies({
        query: value as string,
        department,
      })
        .unwrap()
        .then((results) => {
          setCompanySearchResults(results);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div className="fr-input-group">
      <label className="fr-label">
        Entité contrôlée <AppRequiredInput />
        <span className="fr-hint-text">
          Commencez à saisir le nom, un SIRET ou un SIREN
        </span>
      </label>
      <div className="fr-input-wrap fr-icon-search-line">
        <Autocomplete
          autoComplete
          includeInputInList
          filterSelectedOptions
          value={company}
          onInputChange={handleInputChange}
          onChange={(_, value) => {
            setSearchQuery('');
            if (value) {
              onSelectCompany(value);
            }
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input {...params.inputProps} className="fr-input" type="text" />
            </div>
          )}
          loading={isLoading || isFetching}
          loadingText={`Recherche en cours...`}
          filterOptions={(x) => x}
          options={companySearchResults}
          getOptionLabel={(option) =>
            [
              option.siege.siret,
              option.nom_raison_sociale ?? option.nom_complet,
            ].join(' - ')
          }
          noOptionsText={
            searchQuery.length > 3
              ? 'Aucun résultat'
              : 'Saisir au moins 4 caractères'
          }
        />
      </div>
    </div>
  );
};

export default CompanySearch;
