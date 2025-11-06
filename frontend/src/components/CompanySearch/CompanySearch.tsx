import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete, Box } from '@mui/material';
import clsx from 'clsx';
import { Department } from 'maestro-shared/referential/Department';
import {
  Company,
  companyFromSearchResult
} from 'maestro-shared/schema/Company/Company';
import React, {
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useState
} from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { ApiClientContext } from '../../services/apiClient';
import AppServiceErrorAlert from '../_app/AppErrorAlert/AppServiceErrorAlert';
import './CompanySearch.scss';

type Props = {
  initialCompany?: Company;
  department?: Department;
  onSelectCompany: (company?: Company) => void;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
  companies?: Company[] | null;
  label?: string | React.ReactNode;
};

const nafCodeLabels: Record<string, string> = {
  '01.11Z':
    "Culture de céréales (à l'exception du riz), de légumineuses et de graines oléagineuses",
  '01.12Z': 'Culture du riz',
  '01.13Z': 'Culture de légumes, de melons, de racines et de tubercules',
  '01.14Z': 'Culture de la canne à sucre',
  '01.15Z': 'Culture du tabac',
  '01.16Z': 'Culture de plantes à fibres',
  '01.19Z': 'Autres cultures non permanentes',
  '01.21Z': 'Culture de la vigne',
  '01.22Z': 'Culture de fruits tropicaux et subtropicaux',
  '01.23Z': "Culture d'agrumes",
  '01.24Z': 'Culture de fruits à pépins et à noyau',
  '01.25Z':
    "Culture d'autres fruits d'arbres ou d'arbustes et de fruits à coque",
  '01.26Z': 'Culture de fruits oléagineux',
  '01.27Z': 'Culture de plantes à boissons',
  '01.28Z':
    'Culture de plantes à épices, aromatiques, médicinales et pharmaceutiques',
  '01.29Z': 'Autres cultures permanentes',
  '01.30Z': 'Reproduction de plantes',
  '01.41Z': 'Élevage de vaches laitières',
  '01.42Z': "Élevage d'autres bovins et de buffles",
  '01.43Z': "Élevage de chevaux et d'autres équidés",
  '01.44Z': "Élevage de chameaux et d'autres camélidés",
  '01.45Z': "Élevage d'ovins et de caprins",
  '01.46Z': 'Élevage de porcins',
  '01.47Z': 'Élevage de volailles',
  '01.49Z': "Élevage d'autres animaux",
  '01.50Z': 'Culture et élevage associés',
  '01.61Z': 'Activités de soutien aux cultures',
  '01.62Z': 'Activités de soutien à la production animale',
  '01.63Z': 'Traitement primaire des récoltes',
  '01.64Z': 'Traitement des semences',
  '01.70Z': 'Chasse, piégeage et services annexes',
  '02.10Z': 'Sylviculture et autres activités forestières',
  '02.20Z': 'Exploitation forestière',
  '02.30Z':
    "Récolte de produits forestiers non ligneux poussant à l'état sauvage",
  '02.40Z': "Services de soutien à l'exploitation forestière",
  '03.11Z': 'Pêche en mer',
  '03.12Z': 'Pêche en eau douce',
  '03.21Z': 'Aquaculture en mer',
  '03.22Z': 'Aquaculture en eau douce',
  '55.10Z': 'Hôtels et hébergement similaire',
  '55.20Z': 'Hébergement touristique et autre hébergement de courte durée',
  '55.30Z':
    'Terrains de camping et parcs pour caravanes ou véhicules de loisirs',
  '55.90Z': 'Autres hébergements',
  '56.10A': 'Restauration traditionnelle',
  '56.10B': 'Cafétérias et autres libres-services',
  '56.10C': 'Restauration de type rapide',
  '56.21Z': 'Services des traiteurs',
  '56.29A': 'Restauration collective sous contrat',
  '56.29B': 'Autres services de restauration n.c.a.',
  '56.30Z': 'Débits de boissons'
};

const CompanySearch = ({
  initialCompany,
  department,
  onSelectCompany,
  state,
  stateRelatedMessage,
  companies,
  label
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyResults, setCompanyResults] = useState<Company[]>(
    companies ?? []
  );
  const [searchCompanies, { isLoading, isFetching, isError }] =
    apiClient.useLazySearchCompaniesQuery();
  const [company, setCompany] = useState<Company | null>(
    initialCompany ?? null
  );

  const search = useCallback(
    async (value: string) => {
      if (companies) {
        if (!value || value.length === 0) {
          return companies;
        }
        const searchLower = value.toLowerCase();
        return companies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchLower) ||
            company.siret.includes(value) ||
            company.siret.replace(/\s/g, '').includes(value)
        );
      } else {
        return await searchCompanies({
          query: value,
          department
        })
          .unwrap()
          .then((results) => results.map(companyFromSearchResult));
      }
    },
    [companies, department, searchCompanies]
  );

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (companies || value.length > 1) {
      await search(value)
        .then((results) => {
          setCompanyResults(results);
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
        {label ?? (
          <>
            Entité contrôlée <AppRequiredInput />
            <span className="fr-hint-text">
              Commencez à saisir le nom, un SIRET ou un SIREN
            </span>
          </>
        )}
      </label>
      <div className="fr-input-wrap fr-icon-search-line">
        <Autocomplete
          autoComplete
          includeInputInList
          filterSelectedOptions
          value={company}
          onInputChange={handleInputChange}
          renderOption={(props, option) => {
            // eslint-disable-next-line react/prop-types
            const { className, ...otherProps } = props;
            return (
              <Box
                {...otherProps}
                component="li"
                className={clsx(className, 'option-container')}
              >
                <Box className={'name-container'}>
                  <div>
                    <span className={cx('fr-text--bold')}>{option.name}</span> •{' '}
                    {option.siret}
                  </div>
                  <div>
                    <span className={'address-container'}>
                      {option.address?.toLowerCase() ?? ''}
                    </span>{' '}
                    {option.postalCode} {option.city}
                  </div>
                </Box>
                {option.nafCode && (
                  <Box
                    className={clsx(
                      cx('fr-text--sm', 'fr-m-0'),
                      'naf-container'
                    )}
                  >
                    <span className={cx('fr-text--bold', 'fr-mr-1w')}>
                      {option.nafCode}
                    </span>
                    <span className={'naf-label'}>
                      {nafCodeLabels[option.nafCode] ?? ''}
                    </span>
                  </Box>
                )}
              </Box>
            );
          }}
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
          options={[...companyResults].sort((a, b) =>
            a.name.localeCompare(b.name)
          )}
          getOptionLabel={(option) => [option.name, option.siret].join(' • ')}
          noOptionsText={
            companies
              ? 'Aucun résultat'
              : searchQuery.length > 3
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
      <>
        {isError && !companies && (
          <AppServiceErrorAlert
            message={`L'API Recherche d'entreprises semble inaccessible. Veuillez réessayer ultérieurement.`}
          />
        )}
      </>
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
              }
            }}
          >
            {[company.name, company.siret].join(' • ')}
          </Tag>
        </>
      )}
    </div>
  );
};

export default CompanySearch;
