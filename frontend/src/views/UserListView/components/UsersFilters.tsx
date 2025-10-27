import Accordion from '@codegouvfr/react-dsfr/Accordion';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { Region } from 'maestro-shared/referential/Region';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindList
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { UserRole, UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import { RegionsFilter } from '../../../components/RegionsFilter/RegionsFilter';
import useWindowSize from '../../../hooks/useWindowSize';
import { UsersFilterTags } from './UsersFilterTags';

const _findUserOptions = z.object({
  region: Region.nullable(),
  role: UserRole.nullable(),
  programmingPlanKind: ProgrammingPlanKind.nullable(),
  label: z.string().nullable()
});

export type FindUserOptions = z.infer<typeof _findUserOptions>;

type Props = {
  onChange: (options: FindUserOptions) => void;
};
export const UsersFilters: FunctionComponent<Props> = ({
  onChange,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { isMobile } = useWindowSize();

  const [filters, setFilters] = useState<FindUserOptions>({
    region: null,
    role: null,
    programmingPlanKind: null,
    label: null
  });

  const hasFilter: boolean = useMemo(() => {
    const { label, ...rest } = filters;

    return Object.values(rest).some(
      // @ts-expect-error TS2367
      (value) => isDefinedAndNotNull(value) && value !== ''
    );
  }, [filters]);

  const updateFilters = (newFilters: Partial<FindUserOptions>) => {
    setFilters((old) => ({ ...old, ...newFilters }));
  };

  useEffect(() => {
    onChange(filters);
  }, [onChange, filters]);

  return (
    <>
      {isMobile ? (
        <>
          <Accordion
            label="Filtrer les résultats"
            className="sample-filters-accordion"
          >
            <div className={cx('fr-container')}>
              <Filters {...filters} onChange={updateFilters} />
            </div>
          </Accordion>
          {hasFilter && (
            <div className="d-flex-align-center">
              <UsersFilterTags filters={filters} onChange={updateFilters} />
            </div>
          )}
        </>
      ) : (
        <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
          <div>
            <Filters {...filters} onChange={updateFilters} />
            {hasFilter && (
              <div
                className={clsx('d-flex-align-start', cx('fr-mt-3w'))}
                style={{ flexDirection: 'column' }}
              >
                <span
                  className={cx('fr-text--light', 'fr-text--sm', 'fr-mb-0')}
                >
                  Filtres actifs
                </span>
                <div className={cx('fr-mt-3v')}>
                  <UsersFilterTags filters={filters} onChange={updateFilters} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const Filters: FunctionComponent<
  FindUserOptions & { onChange: (options: Partial<FindUserOptions>) => void }
> = ({ region, role, programmingPlanKind, label, onChange, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Input
          iconId="fr-icon-search-line"
          label="Recherche par nom ou courriel"
          nativeInputProps={{
            type: 'search',
            placeholder: 'nom, courriel...',
            value: label ?? '',
            onChange: (e) =>
              onChange({
                label: e.target.value
              })
          }}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Rôle"
          nativeSelectProps={{
            value: role || '',
            onChange: (e) =>
              onChange({
                role: e.target.value as UserRole
              })
          }}
        >
          <option value="">Tous</option>
          {UserRole.options.map((role) => (
            <option key={`role-${role}`} value={role}>
              {UserRoleLabels[role]}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <RegionsFilter
          defaultValue={region}
          onChange={(r) => onChange({ region: r })}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Plan"
          nativeSelectProps={{
            value: programmingPlanKind || '',
            onChange: (e) =>
              onChange({
                programmingPlanKind: e.target.value as ProgrammingPlanKind
              })
          }}
        >
          <option value="">Tous</option>
          {ProgrammingPlanKindList.map((plan) => (
            <option key={`plan-${plan}`} value={plan}>
              {ProgrammingPlanKindLabels[plan]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
