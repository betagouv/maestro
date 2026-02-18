import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { isEmpty, mapValues, omit, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import {
  Context,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  FindSampleOptions,
  SampleCompliance
} from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus
} from 'maestro-shared/schema/Sample/SampleStatus';
import {
  UserRoleList,
  UserRolePermissions
} from 'maestro-shared/schema/User/UserRole';
import {
  coerceToBooleanNullish,
  isDefinedAndNotNull
} from 'maestro-shared/utils/utils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import FiltersTags from 'src/components/FilterTags/FiltersTags';
import SampleCard from 'src/components/SampleCard/SampleCard';
import SampleTable from 'src/components/SampleTable/SampleTable';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { getURLQuery } from 'src/utils/fetchUtils';
import SampleListHeader from 'src/views/SampleListView/SampleListHeader';
import SamplePrimaryFilters from 'src/views/SampleListView/SamplePrimaryFilters';
import SampleSecondaryFilters from 'src/views/SampleListView/SampleSecondaryFilters';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import food from '../../assets/illustrations/food.svg';
import { ApiClientContext } from '../../services/apiClient';
import SupportDocumentDownload from '../SampleView/DraftSample/SupportDocumentDownload';
import './SampleList.scss';

export type SampleListDisplay = 'table' | 'cards';

const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const apiClient = useContext(ApiClientContext);
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
        contexts:
          (searchParams.get('contexts')?.split(',') as Context[]) ?? undefined,
        region: hasNationalView
          ? (searchParams.get('region') as Region)
          : user?.region,
        departments:
          (searchParams.get('departments')?.split(',') as Department[]) ??
          undefined,
        status: status === 'Draft' ? DraftStatusList : (status ?? undefined),
        matrix: searchParams.get('matrix') as Matrix,
        matrixKind: searchParams.get('matrixKind') as MatrixKind,
        sampledBy: searchParams.get('sampledBy'),
        sampledAt: searchParams.get('sampledAt'),
        reference: searchParams.get('reference'),
        compliance:
          SampleCompliance.safeParse(searchParams.get('compliance')).data ??
          undefined,
        withAtLeastOneResidue:
          coerceToBooleanNullish().safeParse(
            searchParams.get('withAtLeastOneResidue')
          ).data ?? undefined,
        page: Number(searchParams.get('page')) || 1,
        perPage: defaultPerPage
      })
    );
  }, [searchParams, user?.region, sampleListDisplay]); // eslint-disable-line react-hooks/exhaustive-deps

  const canDownloadSupportDocument: boolean =
    programmingPlan?.kinds.includes('PPV') ?? false;

  const { data: samples } = apiClient.useFindSamplesQuery(
    { ...findSampleOptions, programmingPlanId: programmingPlan?.id as string },
    { skip: !programmingPlan }
  );
  const { data: samplesCount } = apiClient.useCountSamplesQuery(
    {
      ...omit(findSampleOptions, 'page', 'perPage'),
      programmingPlanId: programmingPlan?.id as string
    },
    { skip: !programmingPlan }
  );
  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    {
      programmingPlanId: programmingPlan?.id as string,
      contexts: findSampleOptions.contexts
        ? (findSampleOptions.contexts.filter(
            (context) => ProgrammingPlanContext.safeParse(context).success
          ) as ProgrammingPlanContext[])
        : undefined
    },
    {
      skip: !programmingPlan?.id
    }
  );
  const { data: samplers } = apiClient.useFindUsersQuery({
    region: findSampleOptions.region,
    roles: UserRoleList.filter((r) => {
      const permissions = UserRolePermissions[r];
      return (
        permissions.includes('createSample') ||
        permissions.includes('updateSample')
      );
    })
  });

  const changeFilter = (findFilter: Partial<FindSampleOptions>) => {
    const filteredParams = omit(
      omitBy(
        {
          ...mapValues(findSampleOptions, (value) => value?.toString()),
          ...mapValues(findFilter, (value) => value?.toString())
        },
        isEmpty
      ),
      ['page', 'perPage']
    );

    const urlSearchParams = new URLSearchParams(
      filteredParams as Record<string, string>
    );

    setSearchParams(urlSearchParams, { replace: true });
  };

  const newPartialSampleId = useMemo(() => uuidv4(), []);

  if (!programmingPlan || !user) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title={`Prélèvements ${programmingPlan.year}`}
        subtitle="Consultez les dossiers des prélèvements"
        illustration={food}
        action={
          <>
            {hasUserPermission('createSample') && (
              <div
                className={clsx('d-flex-row', 'd-flex-justify-center')}
                style={{ gap: '1rem' }}
              >
                <Button
                  linkProps={{
                    to: AuthenticatedAppRoutes.NewSampleRoute.link(
                      programmingPlan.year
                    ),
                    target: '_self'
                  }}
                  iconId="fr-icon-microscope-line"
                >
                  Saisir un prélèvement
                </Button>
                {canDownloadSupportDocument && (
                  <SupportDocumentDownload
                    partialSample={{
                      id: newPartialSampleId,
                      sampler: user,
                      status: 'Draft' as const,
                      programmingPlanId: programmingPlan.id as string,
                      specificData: {
                        programmingPlanKind: programmingPlan.kinds[0]
                      }
                    }}
                    buttonPriority={'tertiary'}
                    alignRight
                  />
                )}
              </div>
            )}
          </>
        }
      />
      {isOnline ? (
        <>
          {isMobile ? (
            <div>
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
              <div className={cx('fr-mx-2w')}>
                <FiltersTags
                  title="Filtres actifs"
                  filters={findSampleOptions}
                  samplers={samplers}
                  onChange={changeFilter}
                />
              </div>
            </div>
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
                  <FiltersTags
                    title="Filtres actifs"
                    filters={findSampleOptions}
                    samplers={samplers}
                    onChange={changeFilter}
                  />
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
