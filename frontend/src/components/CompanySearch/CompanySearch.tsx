import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete, Box } from '@mui/material';
import { Department } from 'maestro-shared/referential/Department';
import {
  Company,
  companyFromSearchResult
} from 'maestro-shared/schema/Company/Company';
import {
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useState
} from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { ApiClientContext } from '../../services/apiClient';
import AppServiceErrorAlert from '../_app/AppErrorAlert/AppServiceErrorAlert';

type Props = {
  initialCompany?: Company;
  department?: Department;
  onSelectCompany: (company?: Company) => void;
  state?: 'success' | 'error' | 'default';
  stateRelatedMessage?: ReactNode;
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
  '03.22Z': 'Aquaculture en eau douce'
};

const CompanySearch = ({
  initialCompany,
  department,
  onSelectCompany,
  state,
  stateRelatedMessage
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyResults, setCompanyResults] = useState<Company[]>([]);
  const [searchCompanies, { isLoading, isFetching, isError }] =
    apiClient.useLazySearchCompaniesQuery();
  const [company, setCompany] = useState<Company | null>(
    initialCompany ?? null
  );

  const search = useCallback(
    async (value: string) =>
      await searchCompanies({
        query: value,
        department
      })
        .unwrap()
        .then((results) => results.map(companyFromSearchResult)),
    [department, searchCompanies]
  );

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (value.length > 3) {
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
          renderOption={(props, option) => {
            return (
              <Box
                {...props}
                component="li"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'start',
                  alignItems: 'start'
                }}
              >
                <Box>
                  {option.name} ({option.siret})
                </Box>
                <Box>
                  {option.address} {option.postalCode} {option.city}
                </Box>
                {option.nafCode && (
                  <Box>
                    {option.nafCode} {nafCodeLabels[option.nafCode] ?? ''}
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
          options={companyResults}
          getOptionLabel={(option) => [option.siret, option.name].join(' - ')}
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
      <>
        {isError && (
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
            {[company.siret, company.name].join(' - ')}
          </Tag>
        </>
      )}
    </div>
  );
};

export default CompanySearch;
