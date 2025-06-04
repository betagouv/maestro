import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { map } from 'lodash-es';
import { isNotEmpty } from 'maestro-shared/utils/typescript';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import './AppMultiSelect.scss';

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder'
];
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};
type Props = {
  id: string;
  label: string;
};
export const AppMultiSelect: FunctionComponent<Props> = ({
  id,
  label,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [personName, setPersonName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value }
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };
  return (
    <div className={cx('fr-input-group')}>
      <label id={`multi-select-${id}-label`} className={cx('fr-label')}>
        {label}
      </label>
      <div className="fr-input-wrap">
        <Select
          labelId={`multi-select-${id}-label`}
          id={`multi-select-${id}`}
          multiple
          value={personName}
          style={{ paddingLeft: 0 }}
          onChange={handleChange}
          className={'fr-input'}
          input={<Input className="fr-input" type="text" />}
          renderValue={(selected) =>
            isNotEmpty(selected) && (
              <TagsGroup
                id={`multi-select-${id}-tags}`}
                className={cx('fr-ml-1w')}
                tags={map(selected, (value) => ({
                  key: value,
                  className: cx('fr-tag--dismiss', 'fr-mb-0'),
                  children: value,
                  small: true
                }))}
              />
            )
          }
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};
