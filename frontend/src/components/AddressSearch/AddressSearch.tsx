import { Autocomplete } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { AddressSearchResult } from 'shared/schema/Address/AddressSearchResult';
import { useLazySearchAddressesQuery } from 'src/services/address.service';

interface Props {
  onSelectAddress: (address?: AddressSearchResult) => void;
}

const AddressSearch = ({ onSelectAddress }: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addressSearchResults, setAddressSearchResults] = useState<
    AddressSearchResult[]
  >([]);
  const [searchAddresses, { isLoading, isFetching }] =
    useLazySearchAddressesQuery();
  const [address, setAddress] = useState<AddressSearchResult | null>(null);

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (value.length > 3) {
      await searchAddresses({
        query: value as string
      })
        .unwrap()
        .then((results) => {
          setAddressSearchResults(results);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setAddressSearchResults([]);
    }
  };
  return (
    <div className="fr-input-wrap fr-icon-search-line">
      <Autocomplete
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={address}
        onInputChange={handleInputChange}
        onChange={(_, value) => {
          if (value) {
            setAddress(value);
            onSelectAddress(value);
          }
        }}
        renderInput={(params) => (
          <div ref={params.InputProps.ref}>
            <input
              {...params.inputProps}
              className="fr-input"
              type="text"
              placeholder={'Adresse, code postal ou commune'}
            />
          </div>
        )}
        loading={isLoading || isFetching}
        loadingText={`Recherche en cours...`}
        filterOptions={(x) => x}
        options={addressSearchResults}
        getOptionLabel={(option) => option.properties.label}
        noOptionsText={
          searchQuery.length > 3
            ? 'Aucun résultat'
            : 'Saisir au moins 4 caractères'
        }
      />
    </div>
  );
};

export default AddressSearch;
