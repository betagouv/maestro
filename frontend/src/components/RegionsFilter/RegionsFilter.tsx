import Select from '@codegouvfr/react-dsfr/Select';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {
  defaultValue: Region | null;
  onChange: (region: Region) => void;
};
export const RegionsFilter: FunctionComponent<Props> = ({
  defaultValue,
  onChange,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  return (
    <Select
      label="Région"
      nativeSelectProps={{
        value: defaultValue || '',
        onChange: (e) => onChange(e.target.value as Region)
      }}
    >
      <option value="">Toutes les régions</option>
      {[...RegionList]
        .sort((a, b) => Regions[a].name.localeCompare(Regions[b].name))
        .map((region) => (
          <option key={`region-${region}`} value={region}>
            {Regions[region].name}
          </option>
        ))}
    </Select>
  );
};
