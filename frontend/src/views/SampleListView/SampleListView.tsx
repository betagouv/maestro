import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { t } from 'i18next';
import fp from 'lodash';
import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { defaultPerPage } from 'shared/schema/commons/Pagination';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/schema/Department';
import { Region, RegionList, Regions } from 'shared/schema/Region';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
} from 'shared/schema/Sample/SampleStatus';
import { isDefined } from 'shared/utils/utils';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import {
  useCountSamplesQuery,
  useFindSamplesQuery,
} from 'src/services/sample.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { getURLQuery } from 'src/utils/fetchUtils';
import RemoveSample from 'src/views/SampleListView/RemoveSample';

const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission, hasNationalView, userInfos } = useAuthentication();
  const { findSampleOptions } = useAppSelector((state) => state.samples);

  useEffect(() => {
    if (searchParams.size > 0) {
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
          page: Number(searchParams.get('page')) || 1,
          perPage: defaultPerPage,
        })
      );
    }
  }, [searchParams, userInfos?.region]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: samples } = useFindSamplesQuery(findSampleOptions);
  const { data: samplesCount } = useCountSamplesQuery(
    fp.omit(findSampleOptions, 'page', 'perPage')
  );

  const changeFilter = (findFilter: Partial<FindSampleOptions>) => {
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

  const initFilter = () => {
    setSearchParams();
    dispatch(
      samplesSlice.actions.changeFindOptions({
        region: userInfos?.region,
        department: undefined,
        status: undefined,
        page: 1,
        perPage: defaultPerPage,
      })
    );
  };

  const departmentOptions = useMemo(() => {
    const region = userInfos?.region ?? findSampleOptions.region;
    return region ? Regions[region as Region].departments : DepartmentList;
  }, [userInfos?.region, findSampleOptions.region]);

  if (!samples || samplesCount === undefined) {
    return <></>;
  }

  return (
    <section className={cx('fr-py-6w')}>
      <h1>Liste des prélèvements</h1>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {hasNationalView && (
          <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
            <Select
              label="Région"
              nativeSelectProps={{
                value: findSampleOptions.region || '',
                onChange: (e) => {
                  changeFilter({
                    region: e.target.value as Region,
                    department: undefined,
                  });
                },
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
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <Select
            label="Département"
            nativeSelectProps={{
              value: findSampleOptions.department || '',
              onChange: (e) => {
                changeFilter({ department: e.target.value as Department });
              },
            }}
          >
            <option value="">Tous les départements</option>
            {departmentOptions.map((department) => (
              <option key={`department-${department}`} value={department}>
                {`${department} - ${DepartmentLabels[department]}`}
              </option>
            ))}
          </Select>
        </div>
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <Select
            label="Statut"
            nativeSelectProps={{
              value: findSampleOptions.status || '',
              onChange: (e) => {
                changeFilter({ status: e.target.value as SampleStatus });
              },
            }}
          >
            <option value="">Tous les statuts</option>
            <option value={DraftStatusList.join(',')}>Brouillon</option>
            {(['Submitted', 'Sent'] as SampleStatus[]).map((status) => (
              <option key={`status-${status}`} value={status}>
                {SampleStatusLabels[status]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Link to="" onClick={initFilter}>
            Réinitialiser
          </Link>
        </div>
      </div>

      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-2w')}>
        <div className={cx('fr-col-12', 'fr-text--bold')}>
          {t('sample', { count: samplesCount })}
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Table
            noCaption
            fixed
            headers={[
              hasPermission('deleteSample') ? (
                <div className="cell-icon"></div>
              ) : undefined,
              'Identifiant',
              'Date de création',
              'Département',
              "Site d'intervention",
              'Statut',
            ].filter(isDefined)}
            data={samples.map((sample) =>
              [
                hasPermission('deleteSample') ? (
                  <div className="cell-icon">
                    {DraftStatusList.includes(sample.status) && (
                      <RemoveSample sample={sample} />
                    )}
                  </div>
                ) : undefined,
                <Link to={`/prelevements/${sample.id}`}>
                  {sample.reference}
                </Link>,
                format(sample.createdAt, 'dd/MM/yyyy'),
                `${sample.department} - ${DepartmentLabels[sample.department]}`,
                sample.locationName || '',
                <SampleStatusBadge status={sample?.status as SampleStatus} />,
              ].filter(isDefined)
            )}
            className={cx('fr-mb-2w')}
          />
          {samplesCount > defaultPerPage && (
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
        </div>
      </div>
      {hasPermission('createSample') && (
        <Button
          linkProps={{
            to: '/prelevements/nouveau',
            target: '_self',
          }}
          className={cx('fr-mt-4w')}
        >
          Créer un prélèvement
        </Button>
      )}
    </section>
  );
};

export default SampleListView;
