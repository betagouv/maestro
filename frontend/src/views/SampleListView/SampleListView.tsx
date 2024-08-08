import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import Select from '@codegouvfr/react-dsfr/Select';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { t } from 'i18next';
import { default as fp, default as _ } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/referential/Department';
import { Matrix, MatrixList } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { defaultPerPage } from 'shared/schema/commons/Pagination';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
  SampleStatusList,
} from 'shared/schema/Sample/SampleStatus';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  getSampleListExportURL,
  useCountSamplesQuery,
  useFindSamplesQuery,
} from 'src/services/sample.service';
import { useFindUsersQuery } from 'src/services/user.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { getURLQuery } from 'src/utils/fetchUtils';
import SampleFilterTags from 'src/views/SampleListView/SampleFilterTags';
import food from '../../assets/illustrations/food.svg';
import './SampleList.scss';
const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const dispatch = useAppDispatch();
  const { isOnline } = useOnLine();

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission, hasNationalView, userInfos } = useAuthentication();
  const { findSampleOptions } = useAppSelector((state) => state.samples);
  const { isMobile } = useWindowSize();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const status = searchParams.get('status') as SampleStatus;
      dispatch(
        samplesSlice.actions.changeFindOptions({
          programmingPlanId: searchParams.get('programmingPlanId') ?? undefined,
          region:
            userInfos?.region ??
            (searchParams.get('region') as Region) ??
            undefined,
          department:
            (searchParams.get('department') as Department) ?? undefined,
          status: status === 'Draft' ? DraftStatusList : status ?? undefined,
          matrix: searchParams.get('matrix') as Matrix,
          sampledBy: searchParams.get('sampledBy'),
          sampledAt: searchParams.get('sampledAt'),
          page: Number(searchParams.get('page')) || 1,
          perPage: defaultPerPage,
        })
      );
    }
  }, [searchParams, userInfos?.region]); // eslint-disable-line react-hooks/exhaustive-deps

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data: samples } = useFindSamplesQuery(findSampleOptions);
  const { data: samplesCount } = useCountSamplesQuery(
    fp.omit(findSampleOptions, 'page', 'perPage')
  );
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );
  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: findSampleOptions.programmingPlanId as string },
    {
      skip: !findSampleOptions.programmingPlanId,
    }
  );
  const { data: samplers } = useFindUsersQuery({
    region: userInfos?.region,
    role: 'Sampler',
  });

  const changeFilter = (findFilter: FindSampleOptions) => {
    setSearchParams(
      fp.omit(
        fp.omitBy(
          {
            ...fp.mapValues(findSampleOptions, (value) => value?.toString()),
            ...fp.mapValues(findFilter, (value) => value?.toString()),
          },
          fp.isEmpty
        ),
        'page',
        'perPage'
      )
    );
  };

  const departmentOptions = useMemo(() => {
    const region = userInfos?.region ?? findSampleOptions.region;
    return region ? Regions[region as Region].departments : DepartmentList;
  }, [userInfos?.region, findSampleOptions.region]);

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Prélèvements"
        subtitle="Consultez les dossiers des prélèvements"
        illustration={food}
        action={
          <>
            {hasPermission('createSample') && (
              <Button
                linkProps={{
                  to: '/prelevements/nouveau',
                  target: '_self',
                }}
                iconId="fr-icon-microscope-line"
              >
                Saisir un prélèvement
              </Button>
            )}
          </>
        }
      />
      {isOnline ? (
        <>
          <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
            <div className={clsx(cx('fr-mb-2w'), 'd-flex-align-end')}>
              <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <div className={cx('fr-col-12', 'fr-col-md-3')}>
                  <Select
                    label="Matrice"
                    nativeSelectProps={{
                      value: findSampleOptions.matrix || '',
                      onChange: (e) =>
                        changeFilter({ matrix: e.target.value as Matrix }),
                    }}
                  >
                    <option value="">Toutes</option>
                    {selectOptionsFromList(
                      MatrixList.filter(
                        (matrix) =>
                          !findSampleOptions.programmingPlanId ||
                          !prescriptions ||
                          prescriptions.find((p) => p.matrix === matrix)
                      ),
                      {
                        labels: MatrixLabels,
                        withDefault: false,
                      }
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
                  <Select
                    label="Statut"
                    nativeSelectProps={{
                      value: findSampleOptions.status || '',
                      onChange: (e) =>
                        changeFilter({
                          status: e.target.value as SampleStatus,
                        }),
                    }}
                  >
                    <option value="">Tous</option>
                    <option value={DraftStatusList.join(',')}>Brouillon</option>
                    {_.difference(SampleStatusList, DraftStatusList).map(
                      (status) => (
                        <option key={`status-${status}`} value={status}>
                          {SampleStatusLabels[status]}
                        </option>
                      )
                    )}
                  </Select>
                </div>
                <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
                  <Select
                    label="Préleveur"
                    nativeSelectProps={{
                      value: findSampleOptions.sampledBy || '',
                      onChange: (e) =>
                        changeFilter({ sampledBy: e.target.value }),
                    }}
                  >
                    <option value="">Tous</option>
                    {samplers?.map((user) => (
                      <option key={`user-${user.id}`} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
                  <Input
                    label="Date"
                    nativeInputProps={{
                      value: findSampleOptions.sampledAt ?? '',
                      type: 'date',
                      onChange: (e) =>
                        changeFilter({ sampledAt: e.target.value }),
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                priority="secondary"
                className={cx('fr-ml-3w')}
                style={{ minWidth: '140px', justifyContent: 'center' }}
              >
                {isFilterExpanded ? 'Fermer' : 'Plus de filtres'}
              </Button>
            </div>
            {isFilterExpanded && (
              <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                {hasNationalView && (
                  <div
                    className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}
                  >
                    <Select
                      label="Région"
                      nativeSelectProps={{
                        value: findSampleOptions.region || '',
                        onChange: (e) =>
                          changeFilter({
                            region: e.target.value as Region,
                            department: undefined,
                          }),
                      }}
                    >
                      <option value="">Toutes les régions</option>
                      {RegionList.map((region) => (
                        <option key={`region-${region}`} value={region}>
                          {Regions[region].name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                <div className={cx('fr-col-12', 'fr-col-md-3')}>
                  <Select
                    label="Département"
                    nativeSelectProps={{
                      value: findSampleOptions.department || '',
                      onChange: (e) =>
                        changeFilter({
                          department: e.target.value as Department,
                        }),
                    }}
                  >
                    <option value="">Tous</option>
                    {departmentOptions.map((department) => (
                      <option
                        key={`department-${department}`}
                        value={department}
                      >
                        {`${department} - ${DepartmentLabels[department]}`}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
                  <Select
                    label="Contexte"
                    nativeSelectProps={{
                      value: findSampleOptions.programmingPlanId || '',
                      onChange: (e) =>
                        changeFilter({
                          programmingPlanId: e.target.value,
                          matrix: undefined,
                        }),
                    }}
                  >
                    <option value="">Tous</option>
                    {programmingPlans?.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex-align-center">
            <SampleFilterTags
              filters={findSampleOptions}
              programmingPlans={programmingPlans}
              samplers={samplers}
              onChange={changeFilter}
            />
          </div>
          <SampleTable
            samples={samples ?? []}
            tableHeader={
              <>
                <div className={cx('fr-text--bold')}>
                  {t('sample', { count: samplesCount })}
                </div>
                <Button
                  iconId="fr-icon-file-download-line"
                  priority="secondary"
                  onClick={() =>
                    window.open(
                      getSampleListExportURL({
                        ...findSampleOptions,
                        perPage: undefined,
                        page: undefined,
                      })
                    )
                  }
                  title="Exporter"
                  children={isMobile ? undefined : 'Exporter'}
                />
              </>
            }
            tableFooter={
              <>
                {isDefinedAndNotNull(samplesCount) &&
                  samplesCount > defaultPerPage && (
                    <Pagination
                      count={Math.floor(samplesCount / defaultPerPage) + 1}
                      defaultPage={Number(findSampleOptions.page) || 1}
                      getPageLinkProps={(page: number) => ({
                        to: getURLQuery({
                          ...findSampleOptions,
                          page: page.toString(),
                        }),
                      })}
                    />
                  )}
              </>
            }
          />
        </>
      ) : (
        <Skeleton variant="rectangular" height={400} />
      )}
    </section>
  );
};

export default SampleListView;
