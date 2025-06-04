import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import { ListSubheader } from '@mui/material';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { map } from 'lodash-es';
import { isNotEmpty } from 'maestro-shared/utils/typescript';
import { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import {
  AppSelectOption,
  AppSelectOptionsGroup
} from '../AppSelect/AppSelectOption';
import './AppMultiSelect.scss';

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
  onSelect: (items: string[]) => void;
} & (
  | {
      options?: never;
      optionsGroups: AppSelectOptionsGroup[];
    }
  | {
      options: AppSelectOption[];
      optionsGroups?: never;
    }
);

export const AppMultiSelect: FunctionComponent<Props> = ({
  id,
  label,
  options,
  optionsGroups,
  onSelect,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const flatOptions: AppSelectOption[] =
    options ?? optionsGroups.flatMap(({ options }) => options);

  const [selectedItems, setSelectedItems] = useState<string[]>(
    flatOptions.filter(({ selected }) => selected).map(({ value }) => value)
  );

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value }
    } = event;
    console.log('coucocu', value);
    setSelectedItems(typeof value === 'string' ? value.split(',') : value);
  };

  useEffect(() => {
    if (selectedItems) {
      onSelect(selectedItems);
      console.log('COUCOU', selectedItems, options);
    }
  }, [selectedItems]);

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
          displayEmpty={true}
          value={selectedItems}
          placeholder={'Tous'}
          style={{ paddingLeft: 0 }}
          onChange={handleChange}
          className={'fr-input'}
          input={<Input className="fr-input" type="text" placeholder="Tous" />}
          renderValue={(selected) =>
            isNotEmpty(selected) ? (
              <TagsGroup
                id={`multi-select-${id}-tags}`}
                className={cx('fr-ml-1w')}
                style={{ flexWrap: 'nowrap' }}
                tags={map(selected, (value) => ({
                  key: value,
                  className: cx('fr-tag--dismiss', 'fr-mb-0'),
                  children:
                    flatOptions.find((option) => option.value === value)
                      ?.label ?? '',
                  small: true
                }))}
              />
            ) : (
              <em className={cx('fr-ml-1w')}>Tous</em>
            )
          }
          MenuProps={MenuProps}
        >
          {options
            ? options.map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))
            : optionsGroups.map((group) => (
                <Fragment key={group.label}>
                  <ListSubheader>{group.label}</ListSubheader>
                  {group.options.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Fragment>
              ))}
        </Select>
      </div>
    </div>
  );
};
