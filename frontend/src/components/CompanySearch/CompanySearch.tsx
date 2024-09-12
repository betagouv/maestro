import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { ReactNode, SyntheticEvent, useState } from 'react';
import { Department } from 'shared/referential/Department';
import { CompanySearchResult } from 'shared/schema/Company/CompanySearchResult';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { useLazySearchCompaniesQuery } from 'src/services/company.service';

interface Props {
  department?: Department;
  onSelectCompany: (company?: CompanySearchResult) => void;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
}

const CompanySearch = ({
  department,
  onSelectCompany,
  state,
  stateRelatedMessage,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companySearchResults, setCompanySearchResults] = useState<
    CompanySearchResult[]
  >([]);
  const [searchCompanies, { isLoading, isFetching }] =
    useLazySearchCompaniesQuery();
  const [company, setCompany] = useState<CompanySearchResult | null>(null);

  const handleInputChange = async (
    event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

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
    <div
      className={cx(
        'fr-input-group',
        (() => {
          switch (state) {
            case 'error':
              return 'fr-input-group--error';
            case 'success':
              return 'fr-input-group--valid';
            case 'default':
              return undefined;
          }
        })()
      )}
    >
      <label className={cx('fr-label')}>
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
            if (value) {
              setCompany(value);
              onSelectCompany(value);
            }
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                className="fr-input"
                type="text"
                data-testid="companySearch-input"
              />
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
          disabled={company !== null}
        />
      </div>
      {state !== 'default' && (
        <p
          className={cx(
            (() => {
              switch (state) {
                case 'error':
                  return 'fr-error-text';
                case 'success':
                  return 'fr-valid-text';
              }
            })()
          )}
        >
          {stateRelatedMessage}
        </p>
      )}
      {company && (
        <>
          <div className={cx('fr-hint-text', 'fr-my-1w')}>
            Entité sélectionnée
          </div>
          <Tag
            dismissible
            nativeButtonProps={{
              onClick: () => {
                setCompany(null);
                setSearchQuery('');
                onSelectCompany(undefined);
              },
            }}
          >
            {[
              company.siege.siret,
              company.nom_raison_sociale ?? company.nom_complet,
            ].join(' - ')}
          </Tag>
        </>
      )}
    </div>
  );
};

export default CompanySearch;
