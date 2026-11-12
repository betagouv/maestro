import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import type { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type LaboratoryAgreementsFilter = {
  key: string;
  values: readonly string[];
  options: readonly { value: string; label: string }[];
  onRemove: (value: string) => void;
};

type Props = {
  filters: LaboratoryAgreementsFilter[];
};

export const LaboratoryAgreementsFiltersTags: FunctionComponent<Props> = ({
  filters,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  if (filters.every(({ values }) => values.length === 0)) {
    return null;
  }

  return (
    <div className={clsx('d-flex-column', cx('fr-mb-2w'))}>
      <span className={cx('fr-text--light', 'fr-text--sm', 'fr-mb-1v')}>
        Filtres actifs
      </span>
      <div>
        {filters.flatMap(({ key, values, options, onRemove }) =>
          values.map((value) => (
            <Tag
              key={`tag-${key}-${value}`}
              dismissible
              small
              className={clsx(cx('fr-mb-1v'), 'align-left')}
              nativeButtonProps={{ onClick: () => onRemove(value) }}
            >
              {options.find((option) => option.value === value)?.label ?? value}
            </Tag>
          ))
        )}
      </div>
    </div>
  );
};
