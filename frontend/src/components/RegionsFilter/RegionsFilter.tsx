import Select from '@codegouvfr/react-dsfr/Select';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import type { FunctionComponent } from 'react';

type Props = {
  values: Region[];
  onChange: (region: Region) => void;
};

export const RegionsFilter: FunctionComponent<Props> = ({
  values,
  onChange
}) => {
  return (
    <Select
      label="Région"
      nativeSelectProps={{
        value: '',
        onChange: (e) => onChange(e.target.value as Region)
      }}
    >
      <option value="">
        {values.length ? `${values.length} région(s)` : 'Toutes les régions'}
      </option>
      {[...RegionList]
        .sort((a, b) => Regions[a].name.localeCompare(Regions[b].name))
        .filter((region) => !values.includes(region))
        .map((region) => (
          <option key={`region-${region}`} value={region}>
            {Regions[region].name}
          </option>
        ))}
    </Select>
  );
};
