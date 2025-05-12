import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { default as fp } from 'lodash';
import { Department } from 'maestro-shared/referential/Department';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { Region } from 'maestro-shared/referential/Region';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus
} from 'maestro-shared/schema/Sample/SampleStatus';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SampleCard from 'src/components/SampleCard/SampleCard';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import {
  useCountSamplesQuery,
  useFindSamplesQuery
} from 'src/services/sample.service';
import { useFindUsersQuery } from 'src/services/user.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { getURLQuery } from 'src/utils/fetchUtils';
import SampleFiltersTags from 'src/views/SampleListView/SampleFiltersTags';
import SampleListHeader from 'src/views/SampleListView/SampleListHeader';
import SamplePrimaryFilters from 'src/views/SampleListView/SamplePrimaryFilters';
import SampleSecondaryFilters from 'src/views/SampleListView/SampleSecondaryFilters';
import { v4 as uuidv4 } from 'uuid';
import food from '../../assets/illustrations/food.svg';
import SupportDocumentDownload from '../SampleView/DraftSample/SupportDocumentDownload';
import './SampleList.scss';
import { UserRoleList, UserRolePermissions } from 'maestro-shared/schema/User/UserRole';

export type SampleListDisplay = 'table' | 'cards';

const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const dispatch = useAppDispatch();
  const { isOnline } = useOnLine();
  const { isMobile } = useWindowSize();

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasUserPermission, user, hasNationalView } = useAuthentication();
  const { findSampleOptions, sampleListDisplay } = useAppSelector(
    (state) => state.samples
  );
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    const status = searchParams.get('status') as SampleStatus;
    dispatch(
      samplesSlice.actions.changeFindOptions({
        context: searchParams.get('context') as Context,
        region: hasNationalView
          ? (searchParams.get('region') as Region)
          : user?.region,
        department: (searchParams.get('department') as Department) ?? undefined,
        status: status === 'Draft' ? DraftStatusList : (status ?? undefined),
        matrix: searchParams.get('matrix') as Matrix,
        sampledBy: searchParams.get('sampledBy'),
        sampledAt: searchParams.get('sampledAt'),
        reference: searchParams.get('reference'),
        page: Number(searchParams.get('page')) || 1,
        perPage: defaultPerPage
      })
    );
  }, [searchParams, user?.region, sampleListDisplay]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: samples } = useFindSamplesQuery(
    { ...findSampleOptions, programmingPlanId: programmingPlan?.id as string },
    { skip: !programmingPlan }
  );
  const { data: samplesCount } = useCountSamplesQuery(
    {
      ...fp.omit(findSampleOptions, 'page', 'perPage'),
      programmingPlanId: programmingPlan?.id as string
    },
    { skip: !programmingPlan }
  );
  const { data: prescriptions } = useFindPrescriptionsQuery(
    {
      programmingPlanId: programmingPlan?.id as string,
      context: findSampleOptions.context as Context
    },
    {
      skip: !programmingPlan?.id || !findSampleOptions.context
    }
  );
  const { data: samplers } = useFindUsersQuery({
    region: findSampleOptions.region,
    roles: UserRoleList.filter((r) => {
      const permissions = UserRolePermissions[r]
      return permissions.includes('createSample') || permissions.includes('updateSample')
    })
  });

  const changeFilter = (findFilter: Partial<FindSampleOptions>) => {
    const filteredParams = fp.omit(
      fp.omitBy(
        {
          ...fp.mapValues(findSampleOptions, (value) => value?.toString()),
          ...fp.mapValues(findFilter, (value) => value?.toString())
        },
        fp.isEmpty
      ),
      ['page', 'perPage']
    );

    const urlSearchParams = new URLSearchParams(
      filteredParams as Record<string, string>
    );

    setSearchParams(urlSearchParams, { replace: true });
  };

  const hasFilter = useMemo(
    () =>
      Object.values(
        fp.omit(findSampleOptions, 'region', 'page', 'perPage')
      ).some((value) => isDefinedAndNotNull(value) && value !== '') ||
      (findSampleOptions.region && hasNationalView),
    [findSampleOptions, hasNationalView]
  );

  if (!programmingPlan) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title={`Prélèvements ${programmingPlan?.year}`}
        subtitle="Consultez les dossiers des prélèvements"
        illustration={food}
        action={
          <>
            {hasUserPermission('createSample') && (
              <div>
                <Button
                  linkProps={{
                    to: `/prelevements/${programmingPlan?.year}/nouveau`,
                    target: '_self'
                  }}
                  iconId="fr-icon-microscope-line"
                  className={cx('fr-mb-1w')}
                >
                  Saisir un prélèvement
                </Button>
                <SupportDocumentDownload
                  partialSample={{
                    id: uuidv4(),
                    status: 'Draft' as const,
                    programmingPlanId: programmingPlan?.id as string,
                    specificData: {
                      programmingPlanKind: programmingPlan?.kinds[0]
                    }
                  }}
                />
              </div>
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
                  currentUserId={user?.id}
                />
                <SampleSecondaryFilters
                  filters={findSampleOptions}
                  onChange={changeFilter}
                />
              </div>
            </Accordion>
          ) : (
            <div
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className="d-flex-align-start">
                <div>
                  <SamplePrimaryFilters
                    filters={findSampleOptions}
                    onChange={changeFilter}
                    samplers={samplers}
                    prescriptions={prescriptions}
                    currentUserId={user?.id}
                  />
                  {isFilterExpanded && (
                    <SampleSecondaryFilters
                      filters={findSampleOptions}
                      onChange={changeFilter}
                    />
                  )}
                </div>
                <Button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  priority="secondary"
                  className={cx('fr-ml-3w', 'fr-mt-4w')}
                  style={{ minWidth: '140px', justifyContent: 'center' }}
                >
                  {isFilterExpanded ? 'Fermer' : 'Plus de filtres'}
                </Button>
              </div>
            </div>
          )}

          {hasFilter && (
            <div className="d-flex-align-center">
              <SampleFiltersTags
                filters={findSampleOptions}
                samplers={samplers}
                onChange={changeFilter}
              />
            </div>
          )}
          <div
            className={clsx(
              'white-container',
              cx('fr-px-2w', 'fr-px-md-5w', 'fr-py-2w', 'fr-py-md-5w')
            )}
          >
            <div
              className={clsx(cx('fr-mb-2w', 'fr-mb-md-5w'), 'table-header')}
            >
              {
                <SampleListHeader
                  findSampleOptions={findSampleOptions}
                  changeFilter={changeFilter}
                  samplesCount={samplesCount}
                />
              }
            </div>
            {sampleListDisplay === 'cards' && (
              <>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  {samples?.map((sample) => (
                    <div
                      className={cx('fr-col-12', 'fr-col-md-3')}
                      key={sample.id}
                    >
                      <SampleCard sample={sample} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {sampleListDisplay === 'table' && (
              <SampleTable samples={samples ?? []} />
            )}
            {isDefinedAndNotNull(samplesCount) &&
              samplesCount > defaultPerPage && (
                <Pagination
                  count={Math.floor(samplesCount / defaultPerPage) + 1}
                  defaultPage={Number(findSampleOptions.page) || 1}
                  getPageLinkProps={(page: number) => ({
                    to: getURLQuery({
                      ...findSampleOptions,
                      page: page.toString()
                    })
                  })}
                  className={cx('fr-mt-5w')}
                />
              )}
          </div>
        </>
      ) : (
        <Skeleton variant="rectangular" height={400} />
      )}
    </section>
  );
};

export default SampleListView;
