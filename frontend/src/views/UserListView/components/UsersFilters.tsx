import Accordion from '@codegouvfr/react-dsfr/Accordion';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
  DepartmentSort
} from 'maestro-shared/referential/Department';
import { Region, Regions } from 'maestro-shared/referential/Region';
import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import {
  UserRole,
  UserRoleLabels,
  UserRoleSorted
} from 'maestro-shared/schema/User/UserRole';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import { RegionsFilter } from '../../../components/RegionsFilter/RegionsFilter';
import { useAuthentication } from '../../../hooks/useAuthentication';
import useWindowSize from '../../../hooks/useWindowSize';
import { pluralize } from '../../../utils/stringUtils';
import { useUserManagement } from '../useUserManagement';
import { UsersFilterTags } from './UsersFilterTags';

const _findUserOptions = z.object({
  regions: z.array(Region).nullable(),
  departments: z.array(Department).nullable(),
  roles: z.array(UserRole).nullable(),
  stages: z.array(Stage).nullable(),
  label: z.string().nullable(),
  onlyDisabled: z.boolean().nullable()
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
    regions: null,
    roles: null,
    departments: null,
    stages: null,
    label: null,
    onlyDisabled: null
  });

  const hasFilter: boolean = useMemo(() => {
    const { label, ...rest } = filters;

    return Object.values(rest).some(
      (value) =>
        isDefinedAndNotNull(value) &&
        // @ts-expect-error TS2367
        value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true)
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
  FindUserOptions & {
    onChange: (options: Partial<FindUserOptions>) => void;
  }
> = ({
  regions,
  departments,
  roles,
  stages,
  label,
  onlyDisabled,
  onChange,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { account } = useAuthentication();
  const { scope, manageableRoles } = useUserManagement();
  const canFilterByRegion = scope === 'national';
  const canFilterByDepartment = scope === 'national' || scope === 'regional';

  const roleOptions = useMemo(
    () => UserRoleSorted.filter((role) => manageableRoles.includes(role)),
    [manageableRoles]
  );

  const stageOptions = StageList;

  const departmentOptions = useMemo(() => {
    const scopedRegions = canFilterByRegion
      ? (regions ?? [])
      : account?.region
        ? [account.region]
        : [];

    return (
      scopedRegions.length
        ? scopedRegions.flatMap((r) => Regions[r].departments)
        : [...DepartmentList]
    ).sort(DepartmentSort);
  }, [regions, account, canFilterByRegion]);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Input
          iconId="fr-icon-search-line"
          label="Recherche par nom ou courriel"
          nativeInputProps={{
            autoFocus: true,
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
            value: '',
            onChange: (e) =>
              onChange({
                roles: [...(roles ?? []), e.target.value as UserRole]
              })
          }}
        >
          <option value="">
            {roles?.length
              ? pluralize(roles.length, { preserveCount: true })('rôle')
              : 'Tous'}
          </option>
          {roleOptions
            .filter((r) => !(roles ?? []).includes(r))
            .map((r) => (
              <option key={`role-${r}`} value={r}>
                {UserRoleLabels[r]}
              </option>
            ))}
        </Select>
      </div>
      {canFilterByRegion && (
        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <RegionsFilter
            values={regions ?? []}
            onChange={(r) =>
              onChange({ regions: [...(regions ?? []), r], departments: null })
            }
          />
        </div>
      )}
      {canFilterByDepartment && (
        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <Select
            label="Département"
            nativeSelectProps={{
              value: '',
              onChange: (e) =>
                onChange({
                  departments: [
                    ...(departments ?? []),
                    e.target.value as Department
                  ]
                })
            }}
          >
            <option value="">
              {departments?.length
                ? pluralize(departments.length, { preserveCount: true })(
                    'département'
                  )
                : 'Tous'}
            </option>
            {departmentOptions
              .filter((d) => !(departments ?? []).includes(d))
              .map((d) => (
                <option key={`department-${d}`} value={d}>
                  {`${d} - ${DepartmentLabels[d]}`}
                </option>
              ))}
          </Select>
        </div>
      )}
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Stades de prélèvement"
          nativeSelectProps={{
            value: '',
            onChange: (e) =>
              onChange({
                stages: [...(stages ?? []), e.target.value as Stage]
              }),
            disabled: stageOptions.length === 0
          }}
        >
          <option value="">
            {stages?.length
              ? pluralize(stages.length, { preserveCount: true })('stade')
              : 'Tous'}
          </option>
          {stageOptions
            .filter((stage) => !(stages ?? []).includes(stage))
            .map((stage) => (
              <option key={`stage-${stage}`} value={stage}>
                {StageLabels[stage]}
              </option>
            ))}
        </Select>
      </div>

      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <ToggleSwitch
          label="Seulement les désactivés"
          labelPosition="left"
          inputTitle="affiche seulement les utilisateurs désactivés"
          defaultChecked={onlyDisabled ?? false}
          onChange={(checked) =>
            onChange({ onlyDisabled: checked || undefined })
          }
        />
      </div>
    </div>
  );
};
