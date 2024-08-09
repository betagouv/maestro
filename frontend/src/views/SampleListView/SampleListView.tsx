import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { t } from 'i18next';
import { default as fp } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Department } from 'shared/referential/Department';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { Region } from 'shared/referential/Region';
import { defaultPerPage } from 'shared/schema/commons/Pagination';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
} from 'shared/schema/Sample/SampleStatus';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
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
import SampleFiltersTags from 'src/views/SampleListView/SampleFiltersTags';
import SamplePrimaryFilters from 'src/views/SampleListView/SamplePrimaryFilters';
import SampleSecondaryFilters from 'src/views/SampleListView/SampleSecondaryFilters';
import food from '../../assets/illustrations/food.svg';
import './SampleList.scss';
const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const dispatch = useAppDispatch();
  const { isOnline } = useOnLine();
  const { isMobile } = useWindowSize();

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission, userInfos, hasNationalView } = useAuthentication();
  const { findSampleOptions } = useAppSelector((state) => state.samples);

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

  const hasFilter = useMemo(
    () =>
      Object.values(
        fp.omit(findSampleOptions, 'region', 'page', 'perPage')
      ).some((value) => isDefinedAndNotNull(value) && value !== '') ||
      (findSampleOptions.region && hasNationalView),
    [findSampleOptions, hasNationalView]
  );

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
          {isMobile ? (
            <Accordion
              label="Filtrer les résultats"
              className="sample-filters-accordion"
            >
              <div className={cx('fr-container')}>
                <SamplePrimaryFilters
                  filters={findSampleOptions}
                  onChange={changeFilter}
                  samplers={samplers}
                  prescriptions={prescriptions}
                />
                <SampleSecondaryFilters
                  filters={findSampleOptions}
                  onChange={changeFilter}
                  programmingPlans={programmingPlans}
                />
              </div>
            </Accordion>
          ) : (
            <div
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className={clsx(cx('fr-mb-2w'), 'd-flex-align-end')}>
                <SamplePrimaryFilters
                  filters={findSampleOptions}
                  onChange={changeFilter}
                  samplers={samplers}
                  prescriptions={prescriptions}
                />
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
                <SampleSecondaryFilters
                  filters={findSampleOptions}
                  onChange={changeFilter}
                  programmingPlans={programmingPlans}
                />
              )}
            </div>
          )}

          {hasFilter && (
            <div className="d-flex-align-center">
              <SampleFiltersTags
                filters={findSampleOptions}
                programmingPlans={programmingPlans}
                samplers={samplers}
                onChange={changeFilter}
              />
            </div>
          )}
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
